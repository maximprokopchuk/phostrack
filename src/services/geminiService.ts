import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
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

const SYSTEM_PROMPT = `Ты — нутрициолог, специализирующийся на питании для пациентов с ХБП (Хроническая болезнь почек) 5 стадии на перитонеальном диализе.
Оцени содержание фосфора (в мг), калории и КБЖУ (белки, жиры, углеводы в граммах) и электролиты (калий, магний, натрий в мг).

ВАЖНО для ХБП 5 стадии: будь строг в отношении обработанных продуктов и добавок.
Если продукт содержит неорганические фосфатные добавки (E338-E343, переработанное мясо, газировка, фастфуд) — увеличь оценку и упомяни это в объяснении.
Если количество не указано — предполагай стандартную порцию.`;

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

export async function estimatePhosphate(query: string): Promise<PhosphateEstimate> {
  checkApiKey();

  const response = await client.messages.parse({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Оцени содержание фосфора, калории, КБЖУ и электролиты для: "${query}"`,
      },
    ],
    output_config: {
      format: zodOutputFormat(PhosphateEstimateSchema, 'phosphate_estimate'),
    },
  });

  return response.parsed_output as PhosphateEstimate;
}

export async function estimatePhosphateFromImage(base64Image: string, mimeType: string = 'image/jpeg'): Promise<PhosphateEstimate> {
  checkApiKey();

  const response = await client.messages.parse({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
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
    output_config: {
      format: zodOutputFormat(PhosphateEstimateSchema, 'phosphate_estimate'),
    },
  });

  return response.parsed_output as PhosphateEstimate;
}
