import { z } from 'zod';
import { PhosphateEstimate, ModelProvider } from '../types';

const apiKey = process.env.OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODEL_CONFIGS: Record<ModelProvider, { text: string; vision: string }> = {
  llama: {
    text: 'meta-llama/llama-3.1-8b-instruct',
    vision: 'meta-llama/llama-3.2-11b-vision-instruct',
  },
  gemini: {
    text: 'google/gemini-2.0-flash-001',
    vision: 'google/gemini-2.0-flash-001',
  },
};

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

// Reference values per 100g (used in few-shot examples for grounding)
const SYSTEM_PROMPT = `You are a clinical dietitian for CKD stage 5 patients on peritoneal dialysis.
Your task: given a food description, return nutritional data as JSON.

RULES:
- If quantity is not specified, assume a typical single serving (see examples).
- Scale all values proportionally to the actual amount.
- For processed foods with phosphate additives (E338–E343): increase phosphateMg by 30–50% and note it.
- Use established food composition databases (USDA, McCance & Widdowson) as reference.
- Return ONLY valid JSON — no markdown, no text outside JSON.

REFERENCE (per 100g, for your calibration — do not output these):
chicken breast cooked: phosphate 220mg, protein 31g, fat 3.6g, carbs 0g, calories 165, K 256mg, Na 74mg, Mg 29mg
white rice cooked: phosphate 43mg, protein 2.7g, fat 0.3g, carbs 28g, calories 130, K 35mg, Na 1mg, Mg 12mg
whole egg (50g each): phosphate 99mg, protein 6.3g, fat 5g, carbs 0.6g, calories 72, K 63mg, Na 62mg, Mg 6mg
whole milk 200ml: phosphate 184mg, protein 6.6g, fat 6.8g, carbs 9.4g, calories 122, K 296mg, Na 100mg, Mg 20mg
white bread slice 30g: phosphate 57mg, protein 2.7g, fat 1g, carbs 15g, calories 80, K 37mg, Na 142mg, Mg 7mg
boiled potato 150g: phosphate 75mg, protein 3g, fat 0.1g, carbs 26g, calories 117, K 544mg, Na 5mg, Mg 24mg

JSON SCHEMA:
{
  "foodName": "string — descriptive name with quantity",
  "phosphateMg": number,
  "calories": number,
  "proteinG": number,
  "fatG": number,
  "carbsG": number,
  "potassiumMg": number,
  "magnesiumMg": number,
  "sodiumMg": number,
  "confidence": "low" | "medium" | "high",
  "explanation": "string — 1–2 sentences, reasoning, mention additives if relevant"
}

EXAMPLES:

User: 2 яйца вареных
Assistant: {"foodName":"2 варёных яйца (100г)","phosphateMg":198,"calories":144,"proteinG":12.6,"fatG":10,"carbsG":1.2,"potassiumMg":126,"magnesiumMg":12,"sodiumMg":124,"confidence":"high","explanation":"Два яйца по ~50г каждое. Значения масштабированы по базе USDA для варёного яйца."}

User: тарелка гречки с молоком
Assistant: {"foodName":"Гречневая каша с молоком (180г каши + 100мл молока)","phosphateMg":312,"calories":280,"proteinG":10,"fatG":5,"carbsG":48,"potassiumMg":380,"magnesiumMg":74,"sodiumMg":58,"confidence":"medium","explanation":"Гречка содержит ~190мг фосфора на 100г варёной. Молоко добавляет ~92мг. Итого ~312мг — высокий показатель для ХБП."}

User: кусок пиццы пепперони
Assistant: {"foodName":"Пицца пепперони 1 кусок (~125г)","phosphateMg":310,"calories":298,"proteinG":13,"fatG":12,"carbsG":34,"potassiumMg":230,"magnesiumMg":22,"sodiumMg":680,"confidence":"medium","explanation":"Пепперони содержит фосфатные добавки E451, фосфат увеличен на 40%. Высокое содержание натрия из-за переработанного мяса и сыра."}`;

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
      temperature: 0.1,
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

export async function estimatePhosphate(query: string, provider: ModelProvider = 'llama'): Promise<PhosphateEstimate> {
  checkApiKey();

  const model = MODEL_CONFIGS[provider].text;
  return callOpenRouter(model, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: query },
  ]);
}

export async function estimatePhosphateFromImage(
  base64Image: string,
  mimeType: string = 'image/jpeg',
  provider: ModelProvider = 'llama'
): Promise<PhosphateEstimate> {
  checkApiKey();

  const model = MODEL_CONFIGS[provider].vision;
  return callOpenRouter(model, [
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
          text: 'Identify the food in the image and estimate its nutritional values for a standard serving.',
        },
      ],
    },
  ]);
}
