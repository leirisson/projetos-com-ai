import { FastifyInstance } from "fastify";
import { FaqLoader } from "../faq";

export async function faqRoutes(app: FastifyInstance, faqLoader: FaqLoader) {
  app.get("/faq", async (_request, reply) => {
    const perguntas = faqLoader.toQuestionList();
    return reply.send({ perguntas });
  });
}
