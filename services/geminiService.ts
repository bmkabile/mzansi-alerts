import { GoogleGenAI } from "@google/genai";
import { Location } from '../types';

// FIX: Initialize the GoogleGenAI client as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIWeatherAlert = async (location: Location): Promise<string> => {
  console.log('Fetching AI weather for:', location);

  // Prompt for Gemini
  const prompt = `Based on the current time and hyperlocal weather data for latitude ${location.lat} and longitude ${location.lng} in South Africa, provide a concise, one-sentence weather alert. Example: 'Heavy rain expected in 20 mins.' or 'Strong winds developing this afternoon.'`;

  // FIX: Replace the mock implementation with a real API call to the Gemini API.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use 'gemini-2.5-flash' for basic text tasks.
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get weather alert from AI.");
  }
};
