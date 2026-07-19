import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';
import { Server } from 'http';

const runTests = async () => {
  await connectDB();
  
  const server = app.listen(5000, async () => {
    try {
      console.log('Server started for testing...');
      
      // Test 1: GET /api/recipes
      const res1 = await fetch('http://localhost:5000/api/recipes');
      const data1 = await res1.json();
      console.log('GET /api/recipes status:', res1.status, '| Total recipes:', data1.data?.recipes?.length);

      // Test 2: GET /api/recipes/:id
      if (data1.data?.recipes?.length > 0) {
        const firstId = data1.data.recipes[0]._id;
        const res2 = await fetch(`http://localhost:5000/api/recipes/${firstId}`);
        const data2 = await res2.json();
        console.log(`GET /api/recipes/${firstId} status:`, res2.status, '| Title:', data2.data?.recipe?.title);
      }

      // Test 3: POST /api/recipes without token (Protected route)
      const res3 = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' })
      });
      console.log('POST /api/recipes without token status:', res3.status);

      server.close(() => process.exit(0));
    } catch (e) {
      console.error(e);
      server.close(() => process.exit(1));
    }
  });
};

runTests();
