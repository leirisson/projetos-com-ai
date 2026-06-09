import { FastifyInstance } from "fastify";
import { extrairTexto } from "../services/pdf";
import { streamAnalise } from "../services/llm";
import { getPrompt } from "../prompts/prompt_v1";
import { ModoAnalise } from "../types";

const MODOS_VALIDOS: ModoAnalise[] = ["riscos", "obrigacoes", "resumo"];
const MIN_CHARS = 300;
const MAX_CHARS = 80_000;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const sessoesAtivas = new Set<string>();

export async function rotaAnalisar(fastify: FastifyInstance) {
  fastify.post("/analisar", async (request, reply) => {
    const ip = request.ip;

    if (sessoesAtivas.has(ip)) {
      return reply.status(429).send({
        error: "Você já tem uma análise em andamento. Aguarde o resultado.",
      });
    }

    let texto = "";
    let modo: ModoAnalise = "resumo";

    try {
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === "field" && part.fieldname === "modo") {
          modo = part.value as ModoAnalise;
        } else if (part.type === "field" && part.fieldname === "texto") {
          texto = part.value as string;
        } else if (part.type === "file" && part.fieldname === "arquivo") {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          if (buffer.byteLength > MAX_PDF_BYTES) {
            return reply.status(400).send({ error: "PDF maior que 10 MB." });
          }

          texto = await extrairTexto(buffer);
        }
      }

      if (!MODOS_VALIDOS.includes(modo)) {
        return reply.status(400).send({ error: `Modo inválido: ${modo}` });
      }

      if (texto.length < MIN_CHARS) {
        return reply.status(400).send({
          error: `O texto deve ter no mínimo ${MIN_CHARS} caracteres.`,
        });
      }

      if (texto.length > MAX_CHARS) {
        return reply.status(400).send({
          error: `O texto deve ter no máximo ${MAX_CHARS} caracteres.`,
        });
      }

      sessoesAtivas.add(ip);

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      const prompt = getPrompt(texto, modo);

      for await (const token of streamAnalise(prompt)) {
        reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
      }

      reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      reply.raw.end();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro interno.";

      if (!reply.sent) {
        reply.status(500).send({ error: mensagem });
      } else {
        reply.raw.write(`data: ${JSON.stringify({ error: mensagem })}\n\n`);
        reply.raw.end();
      }
    } finally {
      sessoesAtivas.delete(ip);
    }
  });
}
