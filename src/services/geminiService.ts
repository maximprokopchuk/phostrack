import { z } from 'zod';
import { PhosphateEstimate } from '../types';

const apiKey = process.env.OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Llama 3.1 8B — text queries
const TEXT_MODEL = 'meta-llama/llama-3.1-8b-instruct';
// Llama 3.2 11B Vision — image queries (has vision support)
const VISION_MODEL = 'meta-llama/llama-3.2-11b-vision-instruct';

const PhosphateEstimateSchema = z.object({
  foodName: z.string(),
  phosphateMg: z.number(),
  calories: z.number(),
  proteinG: z.number(),
  fatG: z.number(),
  carbsG: z.number(),
  potassiumMg: z.number(),
  magnesiumMg: z.number(),
  sodiumMg: z.number(),
  confidence: z.enum(['low', 'medium', 'high']),
  explanation: z.string(),
});

const SYSTEM_PROMPT = `Ты — нутрициолог, специализирующийся на питании для пациентов с ХБП (Хроническая болезнь почек) 5 стадии на перитонеальном диализе.
Оцени содержание фосфора (в мг), калории и КБЖУ (белки, жиры, углеводы в граммах) и электролиты (калий, магний, натрий в мг).

ВАЖНО для ХБП 5 стадии: будь строг в отношении обработанных продуктов и добавок.
Если продукт содержит неорганические фосфатные добавки (E338-E343, переработанное мясо, газировка, фастфуд) — увеличь оценку и упомяни это в объяснении.
Если количество не указано — предполагай стандартную порцию.

Отвечай ТОЛЬКО валидным JSON без markdown, без пояснений вне JSON, строго по схеме:
{
  "foodName": "название блюда",
  "phosphateMg": 0,
  "calories": 0,
  "proteinG": 0,
  "fatG": 0,
  "carbsG": 0,
  "potassiumMg": 0,
  "magnesiumMg": 0,
  "sodiumMg": 0,
  "confidence": "low" | "medium" | "high",
  "explanation": "объяснение оценки"
}`;

function checkApiKey(): void {
  if (!apiKey) {
    throw new Error('API ключ не найден. Добавьте OPENROUTER_API_KEY в переменные окружения.');
  }
}

async function callOpenRouter(model: string, messages: object[]): Promise<PhosphateEstimate> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Пустой ответ от AI');

  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  return PhosphateEstimateSchema.parse(JSON.parse(cleaned)) as PhosphateEstimate;
}

export async function estimatePhosphate(query: string): Promise<PhosphateEstimate> {
  checkApiKey();

  return callOpenRouter(TEXT_MODEL, [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Оцени содержание фосфора, калории, КБЖУ и электролиты для: "${query}"`,
    },
  ]);
}

export async function estimatePhosphateFromImage(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<PhosphateEstimate> {
  checkApiKey();

  return callOpenRouter(VISION_MODEL, [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
        {
          type: 'text',
          text: 'Определи продукт на изображении и оцени содержание фосфора, калории, КБЖУ и электролиты для стандартной порции.',
        },
      ],
    },
  ]);
}
