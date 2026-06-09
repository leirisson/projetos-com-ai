# Spec 05 — Rota POST /analisar

## Objetivo
Implementar o endpoint principal que recebe o contrato, valida, e retorna a análise via Server-Sent Events (SSE).

## O que você vai aprender
- Como lidar com upload de arquivos em Fastify (`@fastify/multipart`)
- O que são Server-Sent Events (SSE) e por que usamos em vez de WebSocket
- Como conectar todos os serviços (PDF + LLM) em uma rota

---

## Contexto: SSE vs WebSocket

| | SSE | WebSocket |
|--|-----|-----------|
| Direção | Servidor → Cliente (unidirecional) | Bidirecional |
| Protocolo | HTTP simples | Upgrade para WS |
| Ideal para | Streaming de texto, notificações | Chat em tempo real, jogos |
| Compatibilidade | Excelente (funciona atrás de proxy) | Requer configuração extra |

Para streaming de LLM, SSE é perfeito: o servidor empurra tokens, o cliente só recebe.

---

## Tarefas

### 1. Criar `src/routes/analisar.ts`

```typescript
// src/routes/analisar.ts
import { FastifyInstance } from "fastify";
import { extrairTexto } from "../services/pdf";
import { streamAnalise } from "../services/llm";
import { getPrompt } from "../prompts";
import { ModoAnalise } from "../types";

const MODOS_VALIDOS: ModoAnalise[] = ["riscos", "obrigacoes", "resumo"];
const MIN_CHARS = 300;
const MAX_CHARS = 80_000;

// Controle de sessões simultâneas (por IP)
const sessõesAtivas = new Set<string>();

export async function rotaAnalisar(fastify: FastifyInstance) {
  fastify.post("/analisar", async (request, reply) => {
    const ip = request.ip;

    // Bloquear análises simultâneas do mesmo cliente
    if (sessõesAtivas.has(ip)) {
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
          // PDF tem prioridade sobre texto colado
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          if (buffer.byteLength > 10 * 1024 * 1024) {
            return reply.status(400).send({ error: "PDF maior que 10 MB." });
          }

          texto = await extrairTexto(buffer);
        }
      }

      // Validações
      if (!MODOS_VALIDOS.includes(modo)) {
        return reply.status(400).send({ error: `Modo inválido: ${modo}` });
      }

      if (texto.length < MIN_CHARS) {
        return reply
          .status(400)
          .send({ error: `O texto deve ter no mínimo ${MIN_CHARS} caracteres.` });
      }

      if (texto.length > MAX_CHARS) {
        return reply
          .status(400)
          .send({ error: `O texto deve ter no máximo ${MAX_CHARS} caracteres.` });
      }

      // Configurar SSE
      sessõesAtivas.add(ip);

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Desabilita buffer em nginx
      });

      const prompt = getPrompt(texto, modo);

      // Stream da LLM → SSE
      for await (const token of streamAnalise(prompt)) {
        reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
      }

      // Sinalizar fim do stream
      reply.raw.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      reply.raw.end();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro interno.";

      if (!reply.sent) {
        reply.status(500).send({ error: mensagem });
      } else {
        // Stream já aberto — mandar erro via SSE
        reply.raw.write(`data: ${JSON.stringify({ error: mensagem })}\n\n`);
        reply.raw.end();
      }
    } finally {
      sessõesAtivas.delete(ip);
    }
  });
}
```

### 2. Registrar a rota no servidor

Em `src/server.ts`, importe e registre a rota:

```typescript
import { rotaAnalisar } from "./routes/analisar";

// Após registrar os plugins:
fastify.register(rotaAnalisar);
```

### 3. Entender o formato SSE

Cada mensagem SSE tem o formato:
```
data: {"token":"Tipo"}\n\n
data: {"token":" identificado"}\n\n
data: {"done":true}\n\n
```

- `data:` é o prefixo obrigatório do protocolo
- `\n\n` (linha dupla) sinaliza fim de uma mensagem
- O cliente lê cada linha e parseia o JSON dentro de `data:`

### 4. Testar com curl

```bash
curl -X POST http://localhost:3000/analisar \
  -F "modo=resumo" \
  -F "texto=CONTRATO DE PRESTAÇÃO DE SERVIÇOS... (cole 300+ chars aqui)"
```

Você deve ver os tokens chegando linha a linha no terminal.

---

## Critério de conclusão

- [ ] `POST /analisar` com texto curto retorna erro 400
- [ ] `POST /analisar` com texto válido retorna stream SSE
- [ ] Dois requests simultâneos do mesmo IP retornam 429 no segundo
- [ ] PDF inválido retorna erro amigável

## Próximo passo

Com o backend completo, vá para a [Spec 06 — Frontend](./06-frontend.md).
