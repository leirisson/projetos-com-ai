import "dotenv/config";
import path from "path";
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "./generated/prisma";
import { FaqLoader } from "./faq";
import { LlmService } from "./services/llm";
import { HistoryService } from "./services/history";
import { healthRoutes } from "./routes/health";
import { faqRoutes } from "./routes/faq";
import { chatRoutes } from "./routes/chat";

export function buildApp(prisma?: PrismaClient): FastifyInstance {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  const faqPath = path.resolve(__dirname, "../faq.json");
  const faqLoader = new FaqLoader(faqPath);
  
  faqLoader.load();

  const llmService = new LlmService(apiKey);
  const db = prisma ?? new PrismaClient();
  const historyService = new HistoryService(db);

  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

  app.register(healthRoutes);
  app.register(async (instance) => faqRoutes(instance, faqLoader));
  app.register(async (instance) => chatRoutes(instance, faqLoader, llmService, historyService));

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
