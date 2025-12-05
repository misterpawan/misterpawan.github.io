import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiAssistance = async (
  context: string,
  question: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are a friendly Computer Science Tutor explaining Dynamic Programming.
        The user is playing a "Climbing Stairs" game to understand recursion and DP.
        
        Context:
        ${context}
        
        User Question: "${question}"
        
        Keep your answer concise (under 3 sentences if possible), encouraging, and helpful without giving away the answer directly unless asked. 
        Focus on the "Tail Subproblem" concept: solving smaller problems (n-1, n-2) to solve the larger one (n).
      `,
    });
    return response.text || "I'm having trouble thinking right now. Try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I can't connect to the AI tutor at the moment.";
  }
};
