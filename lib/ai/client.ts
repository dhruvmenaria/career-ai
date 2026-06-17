import OpenAI from 'openai';

export const AI_MODEL = 'meta/llama-3.3-70b-instruct';

// Lazily initialised so the module can be imported during `next build`
// without a real NVIDIA_API_KEY present at build time.
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: process.env.NVIDIA_API_KEY ?? 'missing',
    });
  }
  return _client;
}

export async function callAI(prompt: string, maxTokens = 4096): Promise<string> {
  const client = getClient();

  const makeRequest = () =>
    client.chat.completions.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

  try {
    const response = await makeRequest();
    return response.choices[0]?.message?.content ?? '';
  } catch (error: any) {
    if (error?.status === 429) {
      // Rate limited — wait 2 s then retry once
      await new Promise(r => setTimeout(r, 2000));
      const response = await makeRequest();
      return response.choices[0]?.message?.content ?? '';
    }
    throw error;
  }
}

export function safeParseJSON<T>(text: string): T {
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
