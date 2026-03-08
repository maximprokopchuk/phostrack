import { GoogleGenAI, Type } from "@google/genai";
import { PhosphateEstimate } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

function parseSafeJSON(text: string | undefined): any {
  if (!text) throw new Error("Empty response from AI");
  
  try {
    // Remove potential markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini JSON Parse Error. Raw text:", text);
    throw new Error("AI returned invalid data format. Please try again.");
  }
}

export async function estimatePhosphate(query: string): Promise<PhosphateEstimate> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in Vercel settings.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Estimate the phosphate content (in milligrams), calories, and KBJU (protein, fat, carbs in grams) and electrolytes (potassium, magnesium, sodium in milligrams) for the following food description: "${query}". 
      Provide a realistic estimate based on standard nutritional data. 
      IMPORTANT: For CKD Stage 5 patients, be very strict about processed foods and additives. 
      If the food contains potential inorganic phosphate additives (like processed meats, sodas, fast food), increase the estimate and mention it in the explanation.
      If the amount is not specified, assume a standard serving size.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            phosphateMg: { type: Type.NUMBER },
            calories: { type: Type.NUMBER },
            proteinG: { type: Type.NUMBER },
            fatG: { type: Type.NUMBER },
            carbsG: { type: Type.NUMBER },
            potassiumMg: { type: Type.NUMBER },
            magnesiumMg: { type: Type.NUMBER },
            sodiumMg: { type: Type.NUMBER },
            confidence: { 
              type: Type.STRING,
              enum: ["low", "medium", "high"]
            },
            explanation: { type: Type.STRING }
          },
          required: ["foodName", "phosphateMg", "calories", "proteinG", "fatG", "carbsG", "potassiumMg", "magnesiumMg", "sodiumMg", "confidence", "explanation"]
        }
      }
    });

    return parseSafeJSON(response.text);
  } catch (error: any) {
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("Превышен лимит запросов API (Rate Limit). Подождите минуту.");
    }
    throw error;
  }
}

export async function estimatePhosphateFromImage(base64Image: string): Promise<PhosphateEstimate> {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in Vercel settings.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          text: "Identify the food in this image and estimate its phosphate content (mg), calories, KBJU (protein, fat, carbs in g) and electrolytes (potassium, magnesium, sodium in mg) for a standard serving. Return JSON."
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            phosphateMg: { type: Type.NUMBER },
            calories: { type: Type.NUMBER },
            proteinG: { type: Type.NUMBER },
            fatG: { type: Type.NUMBER },
            carbsG: { type: Type.NUMBER },
            potassiumMg: { type: Type.NUMBER },
            magnesiumMg: { type: Type.NUMBER },
            sodiumMg: { type: Type.NUMBER },
            confidence: { 
              type: Type.STRING,
              enum: ["low", "medium", "high"]
            },
            explanation: { type: Type.STRING }
          },
          required: ["foodName", "phosphateMg", "calories", "proteinG", "fatG", "carbsG", "potassiumMg", "magnesiumMg", "sodiumMg", "confidence", "explanation"]
        }
      }
    });

    return parseSafeJSON(response.text);
  } catch (error: any) {
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("Превышен лимит запросов API. Подождите минуту.");
    }
    throw error;
  }
}
