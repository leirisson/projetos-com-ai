import "dotenv/config";
import path from "path";
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { FaqLoader } from "./faq";
import { LlmService } from "./services/llm";
import { healthRoutes } from "./routes/health";
import { faqRoutes } from "./routes/faq";
import { chatRoutes } from "./routes/chat";

export function buildApp(): FastifyInstance {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  const faqPath = path.resolve(__dirname, "../faq.json");
  const faqLoader = new FaqLoader(faqPath);
  faqLoader.load();

  const llmService = new LlmService(apiKey);

  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

  app.register(healthRoutes);
  app.register(async (instance) => faqRoutes(instance, faqLoader));
  app.register(async (instance) => chatRoutes(instance, faqLoader, llmService));

  return app;
}

if (require.main === module) {
  const app = buildApp();
  const port = Number(process.env.PORT) || 3001;
  app.listen({ port, host: "0.0.0.0" }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}
