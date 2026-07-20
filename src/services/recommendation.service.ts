import {Recipe} from '../models/Recipe';
import {Interaction} from '../models/Interaction';
import { generateRecommendationRationale } from './gemini.service';

interface UserPreferences {
  dietType: string[];
  allergies: string[];
}

interface FilterOptions {
  dietType?: string;
  maxCookTime?: number;
}

export const getSmartRecommendations = async (
  userId: string, 
  preferences: UserPreferences,
  filters: FilterOptions = {},
  limit: number = 10
) => {
  // 1. Get user's recent interactions (last 20) to build a profile of interests
  const recentInteractions = await Interaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('recipeId', 'cuisine dietType');

  // Tally up interested cuisines and diets based on recent activity
  const cuisineInterest: Record<string, number> = {};
  const dietInterest: Record<string, number> = {};

  recentInteractions.forEach(interaction => {
    const recipe = interaction.recipeId as any;
    if (recipe) {
      const weight = interaction.type === 'like' ? 2 : 1; // Likes count more than views
      cuisineInterest[recipe.cuisine] = (cuisineInterest[recipe.cuisine] || 0) + weight;
      recipe.dietType?.forEach((dt: string) => {
        dietInterest[dt] = (dietInterest[dt] || 0) + weight;
      });
    }
  });

  // Convert tallies to flat arrays of strings representing the user's active interests
  const activeInterests = [
    ...Object.entries(cuisineInterest).sort((a, b) => b[1] - a[1]).map(e => e[0]),
    ...Object.entries(dietInterest).sort((a, b) => b[1] - a[1]).map(e => e[0])
  ].slice(0, 10);

  // 2. Build MongoDB query
  const query: any = {};

  // HARD EXCLUDE allergies: MongoDB $not with $regex for partial matches in ingredient strings
  if (preferences.allergies && preferences.allergies.length > 0) {
    const allergyRegexes = preferences.allergies.map(a => new RegExp(a, 'i'));
    query.ingredients = { $not: { $in: allergyRegexes } };
  }

  // Apply runtime filters
  if (filters.dietType) {
    query.dietType = filters.dietType;
  }
  if (filters.maxCookTime) {
    query.cookTimeMinutes = { $lte: filters.maxCookTime };
  }

  // 3. Fetch Candidate Recipes (fetch a larger pool to score and sort in memory)
  const candidatePool = await Recipe.find(query).limit(50).lean();

  // 4. Scoring Algorithm
  // Score = (avgRating * 0.4) + (recentCuisineMatch * 0.3) + (dietMatch * 0.3)
  const scoredCandidates = candidatePool.map(recipe => {
    let score = 0;
    
    // Rating weight (up to 5 points * 0.4 = 2.0 max)
    score += (recipe.avgRating || 0) * 0.4;
    
    // Cuisine affinity weight (1.5 max)
    if (cuisineInterest[recipe.cuisine]) {
      score += 1.5;
    }

    // Diet match weight (1.5 max)
    // Boost if the recipe matches their profile preferences OR their recently viewed diet types
    const recipeDiets = recipe.dietType || [];
    const profileMatch = recipeDiets.some(d => preferences.dietType.includes(d));
    const recentMatch = recipeDiets.some(d => dietInterest[d]);
    
    if (profileMatch) score += 1.5;
    else if (recentMatch) score += 1.0;

    return { ...recipe, recommendationScore: score };
  });

  // Sort by score descending and take top N
  scoredCandidates.sort((a, b) => b.recommendationScore - a.recommendationScore);
  const topRecommendations = scoredCandidates.slice(0, limit);

  if (topRecommendations.length === 0) return [];

  // 5. Generate Rationales via Gemini (Batched)
  try {
    const rationalePayload = {
      recipes: topRecommendations.map(r => ({
        id: r._id.toString(),
        title: r.title,
        cuisine: r.cuisine
      })),
      userPreferences: preferences,
      recentInteractions: activeInterests
    };

    const rationalesMap = await generateRecommendationRationale(rationalePayload);

    // 6. Attach rationales to recipes
    return topRecommendations.map(recipe => ({
      ...recipe,
      rationale: rationalesMap[recipe._id.toString()] || 'A great match based on your preferences.'
    }));

  } catch (error) {
    console.error("Failed to generate rationales, falling back to default.", error);
    // Graceful degradation: return recipes without AI rationales if Gemini fails
    return topRecommendations.map(recipe => ({
      ...recipe,
      rationale: 'A highly rated dish we thought you would enjoy.'
    }));
  }
};
