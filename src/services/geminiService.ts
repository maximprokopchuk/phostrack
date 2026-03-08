import { GoogleGenAI, Type } from "@google/genai";
import { PhosphateEstimate } from "../types";

const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

function parseSafeJSON(text: string | undefined): any {
  if (!text) throw new Error("AI вернул пустой ответ");
  
  try {
    // Remove potential markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini JSON Parse Error. Raw text:", text);
    throw new Error("AI вернул данные в неверном формате. Попробуйте еще раз.");
  }
}

async function fetchWithRetry(fn: () => Promise<any>, retries = 2, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error.message?.includes("503") || error.message?.includes("high demand") || error.message?.includes("UNAVAILABLE");
    if (isRetryable && retries > 0) {
      console.log(`Gemini is busy, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

function handleApiError(error: any): never {
  console.error("Gemini API Error:", error);
  
  const message = error.message || "";
  
  if (message.includes("429") || message.includes("quota")) {
    throw new Error("Лимит запросов исчерпан (Quota Exceeded). Это ограничение бесплатной версии Google API. Если вы только что сменили ключ, подождите 1-2 минуты или проверьте лимиты в Google Console.");
  }
  if (message.includes("503") || message.includes("high demand") || message.includes("UNAVAILABLE")) {
    throw new Error("Сервер ИИ перегружен (ошибка 503). Пожалуйста, попробуйте еще раз через 10-20 секунд.");
  }
  if (message.includes("API key not valid") || message.includes("invalid") || message.includes("403")) {
    throw new Error("API ключ недействителен или не имеет доступа. Проверьте правильность ключа в настройках.");
  }
  
  throw new Error(`Ошибка API: ${message || "Неизвестная ошибка"}`);
}

export async function estimatePhosphate(query: string): Promise<PhosphateEstimate> {
  if (!apiKey) {
    throw new Error("API ключ не найден. Пожалуйста, добавьте GEMINI_API_KEY в настройки (Settings -> Secrets).");
  }

  try {
    const response = await fetchWithRetry(() => ai.models.generateContent({
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
    }));

    return parseSafeJSON(response.text);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function estimatePhosphateFromImage(base64Image: string): Promise<PhosphateEstimate> {
  if (!apiKey) {
    throw new Error("API ключ не найден. Пожалуйста, добавьте GEMINI_API_KEY в настройки (Settings -> Secrets).");
  }

  try {
    const response = await fetchWithRetry(() => ai.models.generateContent({
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
    }));

    return parseSafeJSON(response.text);
  } catch (error: any) {
    return handleApiError(error);
  }
}
