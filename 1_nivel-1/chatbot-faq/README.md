# Chatbot de FAQ

Chatbot que responde perguntas frequentes via API REST.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK | **Nivel:** 1 — Iniciante

---

## Descricao

API Fastify com um endpoint de chat. O cliente envia uma pergunta via `POST /chat` e recebe
a resposta via streaming (SSE). A base de conhecimento fica em `faq.json`. Primeiro contato
com Fastify + OpenRouter — sem banco de dados, sem autenticação.

---

## Regras de Negocio

- O chatbot só responde perguntas relacionadas ao domínio definido na base de FAQ.
- Se a pergunta não tiver resposta na base, responde educadamente que não sabe e sugere contato humano.
- As respostas devem ser concisas (máximo 3 parágrafos).
- O histórico da sessão é mantido pelo cliente e reenviado a cada request (multi-turn stateless).

---

## Requisitos Funcionais

- [ ] RF01 — `POST /chat` recebe `{ mensagens: Message[], sessionId: string }`
- [ ] RF02 — Carrega a base de FAQ de `faq.json` ao iniciar o servidor
- [ ] RF03 — Injeta o FAQ no system prompt antes de chamar a LLM
- [ ] RF04 — Resposta via SSE com streaming token a token
- [ ] RF05 — `GET /health` retorna status do servidor
- [ ] RF06 — `GET /faq` retorna a lista de perguntas disponíveis

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — `OPENROUTER_API_KEY` via variável de ambiente, nunca no código
- [ ] RNF03 — Tratamento de erros: retornar `{ error }` com status HTTP correto
- [ ] RNF04 — Fastify com `@fastify/cors` habilitado para desenvolvimento local

---

## Estrutura de Arquivos

```text
chatbot-faq/
├── src/
│   ├── server.ts        # Fastify + registro de rotas
│   ├── routes/
│   │   └── chat.ts      # POST /chat com streaming SSE
│   ├── services/
│   │   └── llm.ts       # Wrapper do OpenRouter SDK
│   ├── faq.ts           # Carregamento e formatação do FAQ
│   └── types.ts         # Message, ChatRequest, FaqItem
├── faq.json
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Como funciona o OpenRouter

O OpenRouter usa a mesma interface do SDK da OpenAI — só muda a `baseURL` e a `apiKey`.
Isso permite trocar de modelo (Claude, GPT-4, Gemini) apenas mudando o campo `model`.

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = "anthropic/claude-sonnet-4-6";
// const MODEL = "openai/gpt-4o";
// const MODEL = "google/gemini-2.0-flash";
```

---

## Tarefas

### Setup

- [ ] `npm init -y` e configurar `tsconfig.json` com `strict: true`
- [ ] Instalar: `npm i fastify @fastify/cors openai dotenv`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`
- [ ] Criar `.env` com `OPENROUTER_API_KEY`
- [ ] Scripts: `"dev": "tsx src/server.ts"`, `"build": "tsc"`

### Servidor

- [ ] Criar `src/server.ts` com Fastify, registrar `@fastify/cors` e iniciar na porta 3001
- [ ] Criar `GET /health` retornando `{ status: "ok" }`
- [ ] Criar `GET /faq` retornando o array de perguntas do `faq.json`

### LLM e Chat

- [ ] Implementar `services/llm.ts` com `streamChat(mensagens, systemPrompt): AsyncIterable<string>`
- [ ] Implementar `faq.ts` com `loadFaq(): string` que formata o JSON para o system prompt
- [ ] Implementar `routes/chat.ts` com `POST /chat` que:
  - Valida o body com schema Zod
  - Abre resposta SSE com `reply.raw`
  - Faz stream do OpenRouter e escreve cada token com `reply.raw.write()`
  - Fecha com `reply.raw.end()`

### Validacao

- [ ] `curl -X POST http://localhost:3001/chat -d '{"mensagens":[{"role":"user","content":"qual o horário?"}]}'`
- [ ] Verificar que os tokens chegam progressivamente (não em bloco)
- [ ] Enviar pergunta fora do escopo e verificar resposta de fallback
- [ ] Enviar segunda mensagem com histórico e verificar contexto preservado

---

## Como executar

```bash
cp .env.example .env
# edite .env com OPENROUTER_API_KEY

npm install
npm run dev
# API em http://localhost:3001
```
