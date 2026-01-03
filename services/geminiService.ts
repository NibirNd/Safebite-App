import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult, ThreatLevel } from "../types";

// Helper to get API key from various environment configurations (Vite, Next.js, or standard Node)
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return process.env.API_KEY || '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

/**
 * Parses the user profile into a prompt string context.
 */
const getSystemInstruction = (profile: UserProfile): string => {
  // Combine all known restrictions
  const allAvoidances = [
    ...profile.allergies,
    ...profile.generatedAvoidanceList,
    ...profile.customAvoidanceList
  ].join(', ');

  return `
    You are an expert clinical dietitian, allergist, and gastroenterologist.
    
    User Profile:
    - Conditions: ${profile.conditions.join(', ') || 'None'}
    - Explicit Allergies: ${profile.allergies.join(', ') || 'None'}
    - Specific Foods to Avoid (User Diary + Inferred): ${allAvoidances || 'None'}
    - Health Goals: ${profile.goals || 'General Health'}
    
    CRITICAL INSTRUCTION ON INFERENCE:
    Even if a specific ingredient is not listed in "Allergies", you MUST infer restrictions based on the "Conditions".
    - If "IBS": Assume sensitivity to High FODMAPs (Onion, Garlic, Wheat, High Fructose, etc.) unless told otherwise.
    - If "Celiac": Strictly forbid Gluten (Wheat, Barley, Rye, Triticale, Malt).
    - If "GERD": Flag common triggers like Mint, Caffeine, Spicy foods, Tomato, Chocolate.
    - If "Lactose Intolerance": Flag high lactose dairy.
    
    Your task is to analyze food items or labels and determine if they are safe for this SPECIFIC user.
    
    Provide a "Threat Level":
    - LOW: Safe to eat.
    - MEDIUM: Proceed with caution (e.g., potential cross-contamination, mild trigger, or small amount of a FODMAP).
    - HIGH: Do NOT eat (contains allergen, gluten for Celiac, or severe trigger).
  `;
};

/**
 * Generates a list of recommended avoidances based on conditions.
 * Uses Gemini 3 Flash.
 */
export const generateDietaryRecommendations = async (conditions: string[], allergies: string[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        The user has these medical conditions: ${conditions.join(', ')}.
        The user has these allergies: ${allergies.join(', ')}.
        
        Generate a JSON list of strictly specific ingredients or food groups they should generally avoid to manage these conditions.
        For example, if IBS is listed, include "Onion", "Garlic", "High Fructose Corn Syrup".
        If Celiac, include "Wheat", "Barley", "Rye".
        Do not include general advice, just the names of ingredients/foods.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            avoidList: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    return data.avoidList || [];

  } catch (error) {
    console.error("Failed to generate dietary recommendations", error);
    return [];
  }
};

/**
 * Analyzes text-based food query using Gemini 3 Flash (Schema supported).
 */
export const analyzeFoodText = async (profile: UserProfile, query: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this food/dish for the user: "${query}".`,
      config: {
        systemInstruction: getSystemInstruction(profile),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            canEat: { type: Type.BOOLEAN },
            threatLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'] },
            shortSummary: { type: Type.STRING },
            detailedReasoning: { type: Type.STRING },
            riskyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  riskImpact: { type: Type.NUMBER, description: "0 to 100 integer representing risk contribution" },
                  reason: { type: Type.STRING }
                }
              }
            }
          },
          required: ["foodName", "canEat", "threatLevel", "shortSummary", "detailedReasoning", "riskyIngredients", "nutrients"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse JSON
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Text Analysis Error:", error);
    throw new Error("Failed to analyze food. Please try again.");
  }
};

/**
 * Analyzes an image (base64) using Gemini 2.5 Flash Image.
 * Note: Nano Banana models do NOT support responseSchema, so we must prompt for JSON and parse carefully.
 */
export const analyzeFoodImage = async (profile: UserProfile, base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Look at this image of food or a food label.
      Analyze it based on the user's restrictions (System Instruction).
      
      Return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
      {
        "foodName": "Identified Name",
        "canEat": boolean,
        "threatLevel": "LOW" | "MEDIUM" | "HIGH",
        "shortSummary": "1 sentence summary",
        "detailedReasoning": "Full explanation",
        "riskyIngredients": ["ing1", "ing2"],
        "nutrients": [
           { "name": "Nutrient Name", "amount": "Estimated Amount", "riskImpact": 0-100, "reason": "Why relevant" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt + "\n\n" + getSystemInstruction(profile) }
        ]
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean up potential markdown code blocks if the model ignores the "no markdown" instruction
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw new Error("Failed to analyze image. Please ensure the image is clear.");
  }
};