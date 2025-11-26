import { GoogleGenAI } from "@google/genai";
import { MissionData } from "../types";

const generateMission = async (difficulty: number): Promise<MissionData> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a sci-fi military commander AI. Generate a mission briefing for a tank combat simulation.
      Difficulty Level: ${difficulty} (on a scale of 1-3).
      
      Return ONLY a raw JSON object with this structure (no markdown, no backticks):
      {
        "title": "Cool Mission Name",
        "briefing": "Short tactical description (max 2 sentences).",
        "targetCount": ${2 + difficulty}
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      title: data.title || "Operation: Neon Storm",
      briefing: data.briefing || "Destroy all hostile units in the sector.",
      targetCount: typeof data.targetCount === 'number' ? data.targetCount : 3
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback
    return {
      title: "Operation: Fallback",
      briefing: "Communications disrupted. Eliminate all targets.",
      targetCount: 3 + difficulty
    };
  }
};

export const geminiService = {
  generateMission
};