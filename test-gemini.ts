import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function testGemini() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Say hello world',
    });
    console.log('Gemini Response:', response.text);
  } catch (error) {
    console.error('Gemini Error:', error);
  }
}

testGemini();
