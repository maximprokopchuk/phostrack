import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { PhosphateEstimate } from '../types';

const apiKey = process.env.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;

const client = new Anthropic({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true,
});

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

const JSON_SCHEMA = `{
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

const SYSTEM_PROMPT = `Ты — нутрициолог, специализирующийся на питании для пациентов с ХБП (Хроническая болезнь почек) 5 стадии на перитонеальном диализе.
Оцени содержание фосфора (в мг), калории и КБЖУ (белки, жиры, углеводы в граммах) и электролиты (калий, магний, натрий в мг).

ВАЖНО для ХБП 5 стадии: будь строг в отношении обработанных продуктов и добавок.
Если продукт содержит неорганические фосфатные добавки (E338-E343, переработанное мясо, газировка, фастфуд) — увеличь оценку и упомяни это в объяснении.
Если количество не указано — предполагай стандартную порцию.

Отвечай ТОЛЬКО валидным JSON без markdown-оформления, строго по схеме:
${JSON_SCHEMA}`;

function validateMimeType(mimeType: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
  if (supported.includes(mimeType as typeof supported[number])) {
    return mimeType as typeof supported[number];
  }
  return 'image/jpeg';
}

function checkApiKey(): void {
  if (!apiKey) {
    throw new Error('API ключ не найден. Добавьте ANTHROPIC_API_KEY в переменные окружения.');
  }
}

function extractAndParse(response: Anthropic.Message): PhosphateEstimate {
  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock?.text) {
    throw new Error('Пустой ответ от AI');
  }
  const cleaned = textBlock.text.replace(/```json\n?|\n?```/g, '').trim();
  return PhosphateEstimateSchema.parse(JSON.parse(cleaned)) as PhosphateEstimate;
}

export async function estimatePhosphate(query: string): Promise<PhosphateEstimate> {
  checkApiKey();

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Оцени содержание фосфора, калории, КБЖУ и электролиты для: "${query}"`,
      },
    ],
  });

  return extractAndParse(response);
}

export async function estimatePhosphateFromImage(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<PhosphateEstimate> {
  checkApiKey();

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: validateMimeType(mimeType),
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: 'Определи продукт на изображении и оцени содержание фосфора, калории, КБЖУ и электролиты для стандартной порции.',
          },
        ],
      },
    ],
  });

  return extractAndParse(response);
}
