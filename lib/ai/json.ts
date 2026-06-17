export function safeParseJSON<T>(text: string): T {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export async function parseJSONWithRetry<T>(producer: () => Promise<string>): Promise<T> {
  try {
    return safeParseJSON<T>(await producer());
  } catch {
    return safeParseJSON<T>(await producer());
  }
}
