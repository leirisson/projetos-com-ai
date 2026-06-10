import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { FaqLoader } from "../faq";
import { LlmService } from "../services/llm";
import { HistoryService } from "../services/history";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  mensagens: z.array(MessageSchema).min(1, "mensagens não pode ser vazio"),
  sessionId: z.string().optional(),
});

export async function chatRoutes(
  app: FastifyInstance,
  faqLoader: FaqLoader,
  llmService: LlmService,
  historyService: HistoryService
) {
  app.post(
    "/chat",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = ChatRequestSchema.safeParse(request.body);

      if (!parseResult.success) {
        const firstError = parseResult.error.errors[0];
        const message =
          firstError?.message === "mensagens não pode ser vazio"
            ? "mensagens não pode ser vazio"
            : "mensagens é obrigatório e deve ser um array";

        const origin = request.headers.origin;
        if (origin) reply.header("Access-Control-Allow-Origin", origin);
        return reply.status(400).send({ error: message });
      }

      const { mensagens, sessionId } = parseResult.data;
      const systemPrompt = buildSystemPrompt(faqLoader.toSystemPrompt());

      const origin = request.headers.origin;
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...(origin && { "Access-Control-Allow-Origin": origin }),
      });

      // Salva a última mensagem do usuário antes de iniciar o stream
      if (sessionId) {
        const lastUserMsg = [...mensagens].reverse().find((m) => m.role === "user");
        if (lastUserMsg) {
          await historyService.upsertSession(sessionId).catch(() => {});
          await historyService.saveMessage(sessionId, "user", lastUserMsg.content).catch(() => {});
        }
      }

      let assistantReply = "";

      try {
        for await (const token of llmService.streamChat(mensagens, systemPrompt)) {
          assistantReply += token;
          reply.raw.write(`data: ${token}\n\n`);
        }
        reply.raw.write("data: [DONE]\n\n");
      } catch {
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
        return;
      }

      // Salva a resposta completa do assistente após o stream
      if (sessionId && assistantReply) {
        await historyService.saveMessage(sessionId, "assistant", assistantReply).catch(() => {});
      }

      reply.raw.end();
    }
  );
}

function buildSystemPrompt(faqContent: string): string {
  return `Você é um assistente de FAQ. Responda apenas perguntas relacionadas aos tópicos abaixo.
Se a pergunta não estiver coberta pelo FAQ, responda educadamente que não tem essa informação e sugira entrar em contato com o suporte humano.
Mantenha as respostas concisas (máximo 3 parágrafos).

BASE DE CONHECIMENTO:
${faqContent}`;
}
