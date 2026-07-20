import { GoogleGenAI } from '@google/genai';
import { ApiError } from '../utils/apiResponse';

if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL: GEMINI_API_KEY is not defined in environment variables.");
}

let aiClient: GoogleGenAI;
const getAI = () => {
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  return aiClient;
};

const safeParseJSON = (text: string) => {
  try {
    // Strip markdown code fences if Gemini returns them
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    
    return JSON.parse(cleanText.trim());
  } catch (err) {
    throw new ApiError(502, 'Failed to parse AI response. The service may have returned an invalid format.');
  }
};

interface RecipePrompt {
  ingredients: string[];
  cuisine: string;
  servings: number;
  length: 'short' | 'detailed';
}

export const generateRecipeContent = async (params: RecipePrompt) => {
  const prompt = `
    You are an expert chef. Create a highly delicious recipe based on the following constraints:
    Ingredients available: ${params.ingredients.join(', ')}
    Cuisine style: ${params.cuisine}
    Servings: ${params.servings}
    Detail level: ${params.length}
    
    You must respond ONLY with a valid JSON object. Do NOT wrap the JSON in markdown blocks. Do not add any conversational text.
    The JSON must exactly match this structure:
    {
      "title": "A creative, appetizing name for the dish",
      "description": "A mouth-watering description of the dish",
      "ingredients": [
        "exact measurement and ingredient 1",
        "exact measurement and ingredient 2"
      ],
      "instructions": [
        "Step 1...",
        "Step 2..."
      ]
    }
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new ApiError(502, 'AI returned an empty response.');
    }

    return safeParseJSON(response.text);
  } catch (error: any) {
    console.error('Gemini Recipe Generation Error:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'The AI service encountered an error while generating your recipe.');
  }
};

interface RationalePrompt {
  recipes: Array<{ id: string, title: string, cuisine: string }>;
  userPreferences: { dietType: string[], allergies: string[] };
  recentInteractions: string[];
}

export const generateRecommendationRationale = async (params: RationalePrompt) => {
  if (params.recipes.length === 0) return {};

  const prompt = `
    You are an expert culinary advisor. I will give you a user's preferences, their recent interests, and a list of candidate recipes they have been recommended.
    
    User Dietary Preferences: ${params.userPreferences.dietType.join(', ') || 'None'}
    User Allergies: ${params.userPreferences.allergies.join(', ') || 'None'}
    Recent Interests/Interactions: ${params.recentInteractions.join(', ') || 'None'}
    
    Candidate Recipes:
    ${params.recipes.map(r => `ID: ${r.id}, Title: ${r.title}, Cuisine: ${r.cuisine}`).join('\n')}
    
    For each candidate recipe, write a short, compelling, one-sentence rationale (max 15 words) explaining why the user would love this dish based on their preferences or interests.
    
    Respond ONLY with a valid JSON object mapping the recipe ID to the rationale string. Do not wrap in markdown.
    Example output format:
    {
      "recipe_id_1": "Perfect for your keto diet and love for Italian cuisine.",
      "recipe_id_2": "A hearty choice matching your recent interest in comfort food."
    }
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new ApiError(502, 'AI returned an empty response.');
    }

    return safeParseJSON(response.text);
  } catch (error: any) {
    console.error('Gemini Rationale Error:', error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, 'The AI service failed to generate recommendation rationales.');
  }
};
