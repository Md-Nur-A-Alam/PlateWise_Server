/**
 * Demo User Credentials:
 * Email: demo@platewise.com
 * Password: DemoPassword123!
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Recipe } from '../models/Recipe';
import { Review } from '../models/Review';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Review.deleteMany({});
    await mongoose.connection.collection('account').deleteMany({}); // Better auth account collection

    console.log('Cleared existing data');

    // Call Better Auth running on Next.js to register the demo user properly
    try {
      const clientUrl = process.env.CLIENT_URL || '';
      const demoRes = await fetch(`${clientUrl}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': clientUrl },
        body: JSON.stringify({
          email: 'demo@platewise.com',
          password: 'DemoPassword123!',
          name: 'Demo User'
        })
      });
      if (!demoRes.ok) {
        console.error('Failed to create demo user via API:', await demoRes.text());
        throw new Error('Demo user creation failed');
      }
      console.log('Demo user created via Better Auth HTTP API');
    } catch (e) {
      console.error('Could not reach Next.js server to create demo user. Is it running on port 3000?', e);
      throw e;
    }

    // We also need to get the Mongoose ObjectID for the recipes
    const demoUser = await User.findOne({ email: 'demo@platewise.com' });
    if (demoUser) {
        demoUser.dietaryPreferences = ['None'];
        demoUser.allergies = [];
        await demoUser.save();
    } else {
        throw new Error('Demo user not found in DB after API creation');
    }

    
    // 15 Recipes
    const recipes = [
      {
        title: 'Classic Margherita Pizza',
        shortDescription: 'Traditional Italian pizza with fresh basil and mozzarella.',
        fullDescription: 'A classic Margherita pizza features a simple tomato sauce, fresh mozzarella cheese, and fresh basil leaves.',
        ingredients: ['Pizza dough', 'San Marzano tomatoes', 'Fresh mozzarella', 'Fresh basil', 'Olive oil'],
        images: ['https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Italian',
        dietType: ['Vegetarian'],
        cookTimeMinutes: 20,
        difficulty: 'Medium',
        authorId: demoUser?._id,
        avgRating: 4.8
      },
      {
        title: 'Vegan Thai Green Curry',
        shortDescription: 'Spicy and fragrant coconut curry with mixed vegetables.',
        fullDescription: 'This vegan Thai green curry is packed with flavor from green curry paste, coconut milk, and fresh vegetables.',
        ingredients: ['Green curry paste', 'Coconut milk', 'Tofu', 'Bamboo shoots', 'Bell peppers', 'Thai basil'],
        images: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Thai',
        dietType: ['Vegan', 'Gluten-Free'],
        cookTimeMinutes: 30,
        difficulty: 'Easy',
        authorId: demoUser._id,
        avgRating: 4.5
      },
      {
        title: 'Spicy Beef Tacos',
        shortDescription: 'Authentic Mexican street-style beef tacos.',
        fullDescription: 'Tender, marinated beef cooked to perfection and served on warm corn tortillas with fresh salsa and cilantro.',
        ingredients: ['Flank steak', 'Corn tortillas', 'Onion', 'Cilantro', 'Lime', 'Salsa roja'],
        images: ['https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Mexican',
        dietType: ['Dairy-Free'],
        cookTimeMinutes: 40,
        difficulty: 'Medium',
        authorId: demoUser._id,
        avgRating: 4.9
      },
      {
        title: 'Japanese Miso Soup',
        shortDescription: 'Comforting and traditional savory soup.',
        fullDescription: 'A simple and traditional Japanese soup made with dashi stock and softened miso paste.',
        ingredients: ['Dashi stock', 'Miso paste', 'Silken tofu', 'Wakame seaweed', 'Scallions'],
        images: ['https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Japanese',
        dietType: ['Pescatarian'],
        cookTimeMinutes: 15,
        difficulty: 'Easy',
        authorId: demoUser._id,
        avgRating: 4.2
      },
      {
        title: 'Indian Butter Chicken',
        shortDescription: 'Rich and creamy tomato curry with tender chicken.',
        fullDescription: 'Murgh Makhani, known as Butter Chicken, is a rich and creamy curry made with spiced tomato and butter sauce.',
        ingredients: ['Chicken thighs', 'Yogurt', 'Tomato puree', 'Butter', 'Heavy cream', 'Garam masala'],
        images: ['https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Indian',
        dietType: ['Gluten-Free'],
        cookTimeMinutes: 50,
        difficulty: 'Hard',
        authorId: demoUser._id,
        avgRating: 4.9
      },
      {
        title: 'Greek Quinoa Salad',
        shortDescription: 'Healthy, refreshing, and protein-packed salad.',
        fullDescription: 'A vibrant Mediterranean salad loaded with quinoa, cucumbers, tomatoes, feta, and Kalamata olives.',
        ingredients: ['Quinoa', 'Cucumber', 'Cherry tomatoes', 'Red onion', 'Feta cheese', 'Kalamata olives', 'Olive oil'],
        images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Greek',
        dietType: ['Vegetarian', 'Gluten-Free'],
        cookTimeMinutes: 25,
        difficulty: 'Easy',
        authorId: demoUser._id,
        avgRating: 4.6
      },
      {
        title: 'Korean Beef Bulgogi',
        shortDescription: 'Sweet and savory grilled marinated beef.',
        fullDescription: 'Thinly sliced ribeye marinated in a sweet and savory sauce of soy, sesame, garlic, and pear.',
        ingredients: ['Ribeye beef', 'Soy sauce', 'Sesame oil', 'Garlic', 'Asian pear', 'Brown sugar'],
        images: ['https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Korean',
        dietType: ['Dairy-Free'],
        cookTimeMinutes: 45,
        difficulty: 'Medium',
        authorId: demoUser._id,
        avgRating: 4.7
      },
      {
        title: 'French Onion Soup',
        shortDescription: 'Rich beef broth topped with melted gruyere.',
        fullDescription: 'Caramelized onions in a rich beef broth, topped with a slice of toasted baguette and melted Gruyère cheese.',
        ingredients: ['Yellow onions', 'Beef broth', 'Butter', 'Baguette', 'Gruyere cheese', 'Thyme'],
        images: ['https://images.unsplash.com/photo-1548943487-a2e4e43b4859?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'French',
        dietType: [],
        cookTimeMinutes: 90,
        difficulty: 'Medium',
        authorId: demoUser._id,
        avgRating: 4.8
      },
      {
        title: 'Vietnamese Pho',
        shortDescription: 'Fragrant beef noodle soup.',
        fullDescription: 'A delicate and aromatic beef broth poured over rice noodles, thinly sliced beef, and fresh herbs.',
        ingredients: ['Beef bones', 'Rice noodles', 'Flank steak', 'Star anise', 'Cinnamon', 'Thai basil', 'Bean sprouts'],
        images: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Vietnamese',
        dietType: ['Gluten-Free', 'Dairy-Free'],
        cookTimeMinutes: 180,
        difficulty: 'Hard',
        authorId: demoUser._id,
        avgRating: 4.9
      },
      {
        title: 'Spanish Seafood Paella',
        shortDescription: 'Classic saffron rice dish with mixed seafood.',
        fullDescription: 'A vibrant Spanish dish combining saffron-infused Bomba rice with shrimp, mussels, clams, and chorizo.',
        ingredients: ['Bomba rice', 'Saffron', 'Shrimp', 'Mussels', 'Chicken broth', 'Bell peppers'],
        images: ['https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Spanish',
        dietType: ['Pescatarian'],
        cookTimeMinutes: 60,
        difficulty: 'Hard',
        authorId: demoUser._id,
        avgRating: 4.5
      },
      {
        title: 'Avocado Toast with Poached Egg',
        shortDescription: 'Simple and nutritious breakfast staple.',
        fullDescription: 'Creamy mashed avocado on sourdough toast, topped with a perfectly poached egg and red pepper flakes.',
        ingredients: ['Sourdough bread', 'Avocado', 'Eggs', 'Lemon juice', 'Red pepper flakes', 'Sea salt'],
        images: ['https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'American',
        dietType: ['Vegetarian'],
        cookTimeMinutes: 15,
        difficulty: 'Easy',
        authorId: demoUser._id,
        avgRating: 4.4
      },
      {
        title: 'Mushroom Risotto',
        shortDescription: 'Creamy Italian rice dish with earthy mushrooms.',
        fullDescription: 'Arborio rice slowly cooked with white wine, vegetable broth, and parmesan, finished with wild mushrooms.',
        ingredients: ['Arborio rice', 'Wild mushrooms', 'White wine', 'Vegetable broth', 'Parmesan cheese', 'Butter'],
        images: ['https://images.unsplash.com/photo-1626200419188-f86a9f5d1350?q=80&w=800&auto=format&fit=crop'],
        cuisine: 'Italian',
        dietType: ['Vegetarian'],
        cookTimeMinutes: 45,
        difficulty: 'Medium',
        authorId: demoUser._id,
        avgRating: 4.7
      }
    ];

    const insertedRecipes = await Recipe.insertMany(recipes);
    console.log(`Inserted ${insertedRecipes.length} recipes`);

    // Add some reviews
    const reviews = [
      {
        recipeId: insertedRecipes[0]._id,
        userId: demoUser._id,
        rating: 5,
        comment: 'Absolutely delicious! The crust was perfect.'
      },
      {
        recipeId: insertedRecipes[1]._id,
        userId: demoUser._id,
        rating: 4,
        comment: 'Great flavor, but I added more chili for extra heat.'
      },
      {
        recipeId: insertedRecipes[4]._id,
        userId: demoUser._id,
        rating: 5,
        comment: 'Better than my local Indian restaurant.'
      },
    ];

    await Review.insertMany(reviews);
    console.log('Inserted reviews');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
