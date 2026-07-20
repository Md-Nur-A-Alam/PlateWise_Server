import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

// One-time startup env var audit
const requiredServerVars = [
  'MONGODB_URI', 'BETTER_AUTH_SECRET', 'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET', 'GEMINI_API_KEY', 'IMG_BB', 'CLIENT_URL'
];
console.log('--- SERVER ENV AUDIT ---');
console.log('Current working directory:', process.cwd());
const missingServerVars = requiredServerVars.filter(v => process.env[v] === undefined);
if (missingServerVars.length > 0) {
  console.error('MISSING REQUIRED SERVER ENV VARS:', missingServerVars);
} else {
  console.log('All required server env vars are defined.');
}
console.log('------------------------');

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
