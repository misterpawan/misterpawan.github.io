import { GoogleGenAI } from "@google/genai";
import { DemoType } from '../types';

const getSystemInstruction = (demoType: DemoType, gameState: string) => {
  const base = `You are a friendly and helpful Teaching Assistant for a course on Sequential Decision Making. 
  The topic is "Finite Horizon Problems". 
  Your goal is to explain concepts like "planning horizon", "utility function", "policy", and "state transitions" using the current active demo as a metaphor.
  Keep responses concise (under 3 sentences) and motivating.
  
  Current Context:
  Demo: ${demoType}
  Game State: ${gameState}
  `;

  if (demoType === DemoType.ROBOT) {
    return base + `
    Specifics: The user is navigating a grid. Explain that moves are costly and the horizon (steps remaining) limits the reachable set of states.
    `;
  } else if (demoType === DemoType.PORTFOLIO) {
    return base + `
    Specifics: The user is managing a portfolio over N years. Explain "Horizon Effect": simpler risks are acceptable early on, but as T -> 0, variance becomes dangerous (or necessary if behind target).
    `;
  } else {
    return base + `
    Specifics: The user is playing a real-time runner. Explain the trade-off between speed (reaching goal in time) and safety (avoiding obstacles).
    `;
  }
};

export const getTutorResponse = async (
  message: string, 
  demoType: DemoType, 
  gameState: any
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "Please provide an API Key to enable the AI Tutor.";

    const ai = new GoogleGenAI({ apiKey });
    
    // We create a fresh model instance for each request to ensure stateless context with updated system instruction
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(demoType, JSON.stringify(gameState)),
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble thinking right now. Please try again later.";
  }
};
