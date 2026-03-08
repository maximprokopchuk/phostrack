import { GoogleGenAI, Type } from "@google/genai";
import { PhosphateEstimate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function estimatePhosphate(query: string): Promise<PhosphateEstimate> {
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

  return JSON.parse(response.text || "{}");
}

export async function estimatePhosphateFromImage(base64Image: string, mimeType: string = "image/jpeg"): Promise<PhosphateEstimate> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: "Identify the food in this image and estimate its phosphate content (mg), calories, KBJU (protein, fat, carbs in g) and electrolytes (potassium, magnesium, sodium in mg) for a standard serving."
      },
      {
        inlineData: {
          mimeType,
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

  return JSON.parse(response.text || "{}");
}
