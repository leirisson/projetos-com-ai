import { OpenRouter } from "@openrouter/sdk";
import { env } from "../env";

const client = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  httpReferer: env.SITE_URL,
  appTitle: env.SITE_NAME,
});

const MODEL = "anthropic/claude-sonnet-4-6";

export async function* streamAnalise(prompt: string): AsyncGenerator<string> {
  const result = client.callModel({
    model: MODEL,
    input: prompt,
  });

  for await (const delta of result.getTextStream()) {
    if (delta) {
      yield delta;
    }
  }
}
