import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGenerateContent = vi.fn()

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
  Type: {
    OBJECT: 'object',
    STRING: 'string',
    NUMBER: 'number',
  },
}))

import { estimatePhosphate, estimatePhosphateFromImage } from '../services/geminiService'

const mockEstimate = {
  foodName: 'Яйцо',
  phosphateMg: 95,
  calories: 78,
  proteinG: 6,
  fatG: 5,
  carbsG: 0.6,
  potassiumMg: 69,
  magnesiumMg: 6,
  sodiumMg: 71,
  confidence: 'high',
  explanation: 'Стандартное куриное яйцо',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGenerateContent.mockResolvedValue({
    text: JSON.stringify(mockEstimate),
  })
})

describe('estimatePhosphate', () => {
  it('calls generateContent and returns parsed result', async () => {
    const result = await estimatePhosphate('1 яйцо')
    expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    expect(result.foodName).toBe('Яйцо')
    expect(result.phosphateMg).toBe(95)
    expect(result.confidence).toBe('high')
  })

  it('includes query in the prompt', async () => {
    await estimatePhosphate('творог 100г')
    const call = mockGenerateContent.mock.calls[0][0]
    expect(call.contents).toContain('творог 100г')
  })

  it('returns empty object when response text is empty', async () => {
    mockGenerateContent.mockResolvedValue({ text: '' })
    const result = await estimatePhosphate('тест')
    expect(result).toEqual({})
  })

  it('propagates API errors', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'))
    await expect(estimatePhosphate('тест')).rejects.toThrow('API Error')
  })
})

describe('estimatePhosphateFromImage', () => {
  it('calls generateContent with image data', async () => {
    const fakeBase64 = 'abc123=='
    const result = await estimatePhosphateFromImage(fakeBase64)
    expect(mockGenerateContent).toHaveBeenCalledTimes(1)
    const call = mockGenerateContent.mock.calls[0][0]
    const imageContent = call.contents.find((c: { inlineData?: { data: string } }) => c.inlineData)
    expect(imageContent.inlineData.data).toBe(fakeBase64)
    expect(result.foodName).toBe('Яйцо')
  })

  it('propagates API errors', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Network Error'))
    await expect(estimatePhosphateFromImage('base64')).rejects.toThrow('Network Error')
  })
})
