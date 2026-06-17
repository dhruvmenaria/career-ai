import Anthropic from "@anthropic-ai/sdk";
import { hasAnthropicConfig } from "@/lib/env";

const anthropic = hasAnthropicConfig()
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function callClaude(prompt: string, maxTokens = 4096): Promise<string> {
  if (!anthropic) {
    throw new Error("Anthropic API key is not configured.");
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }]
  });

  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return block.text;
}

export async function callClaudeStream(prompt: string) {
  if (!anthropic) {
    throw new Error("Anthropic API key is not configured.");
  }

  return anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  });
}
