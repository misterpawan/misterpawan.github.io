import { GoogleGenAI, Type } from "@google/genai";
import { CityGenerationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCityInfo = async (cityName: string): Promise<CityGenerationResponse> => {
  const model = "gemini-2.5-flash";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate data for a city named "${cityName}" for a game map. 
    The map is a 100x100 grid roughly representing the world (0,0 is top-left, 100,100 is bottom-right). 
    Provide coordinates that roughly correspond to its real-world location on a Mercator-like projection mapped to 0-100 x/y.
    Also provide a fun single emoji and a short 1-sentence description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          emoji: { type: Type.STRING },
          description: { type: Type.STRING },
          x: { type: Type.NUMBER, description: "X coordinate between 5 and 95" },
          y: { type: Type.NUMBER, description: "Y coordinate between 5 and 95" },
        },
        required: ["name", "emoji", "description", "x", "y"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as CityGenerationResponse;
};

export const getTspHint = async (cities: string[]): Promise<string> => {
    // A fun feature to ask AI for a hint or roast
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
        model,
        contents: `I am playing a Travelling Salesman Game with these cities: ${cities.join(', ')}. 
        Give me a short, cryptic, 1-sentence hint about which city I should visit after ${cities[0]} to minimize distance. 
        Be witty.`,
    });
    return response.text || "Follow your nose!";
}
