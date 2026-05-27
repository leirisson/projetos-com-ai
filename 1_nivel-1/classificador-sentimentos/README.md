# Classificador de Sentimentos

Classifica sentimento de textos via API REST com structured output.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK | **Nivel:** 1 — Iniciante

---

## Descricao

API Fastify que recebe um texto e retorna a classificação de sentimento em JSON tipado.
Suporta análise individual (`POST /classificar`) e processamento em lote (`POST /classificar/lote`).
Foco em structured output — forçar a LLM a retornar JSON previsível e tipado.

---

## Regras de Negocio

- A classificação é uma das três categorias fixas: `positivo`, `negativo` ou `neutro`.
- Cada resultado inclui `score` (0.0–1.0) e `justificativa`.
- Textos com menos de 5 caracteres retornam erro `400`.
- No modo lote, máximo de 50 textos por request.
- No modo lote, cada item é processado com delay de 300ms para respeitar rate limit.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /classificar` com body `{ texto: string }` — analisa um único texto
- [ ] RF02 — `POST /classificar/lote` com body `{ textos: string[] }` — analisa em lote
- [ ] RF03 — Cada resultado retorna `{ sentimento, score, justificativa }`
- [ ] RF04 — `GET /health` — status do servidor
- [ ] RF05 — No modo lote, retornar progresso parcial via SSE conforme os itens são processados

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — Validação de schema no body com Zod
- [ ] RNF03 — Prompt instrui a LLM a retornar JSON com campos fixos
- [ ] RNF04 — Retry automático (máx 3 tentativas) em caso de JSON inválido na resposta
- [ ] RNF05 — `OPENROUTER_API_KEY` via variável de ambiente

---

## Estrutura de Arquivos

```text
classificador-sentimentos/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── classificar.ts     # POST /classificar e POST /classificar/lote
│   ├── services/
│   │   └── classifier.ts      # Lógica de classificação e retry
│   └── types.ts               # SentimentType, ClassificationResult, BatchRequest
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Contrato da API

```typescript
// POST /classificar
// Request
{ texto: string }

// Response 200
{
  sentimento: "positivo" | "negativo" | "neutro",
  score: number,          // 0.0 a 1.0
  justificativa: string
}

// POST /classificar/lote
// Request
{ textos: string[] }      // máx 50 itens

// Response: SSE, um evento por item
// data: { indice: 0, texto: "...", sentimento: "...", score: 0.9, justificativa: "..." }
// data: { indice: 1, ... }
// data: [DONE]
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i fastify @fastify/cors openai zod dotenv`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`

### Servidor e Rotas

- [ ] `server.ts` com Fastify, `@fastify/cors`, iniciar na porta 3001
- [ ] `routes/classificar.ts` com `POST /classificar` validado com Zod
- [ ] `routes/classificar.ts` com `POST /classificar/lote` com SSE e delay de 300ms

### Servico

- [ ] `classifier.ts` com `classify(texto: string): Promise<ClassificationResult>`
- [ ] Prompt que exige JSON: `{ "sentimento": "...", "score": 0.0, "justificativa": "..." }`
- [ ] Parse do JSON da resposta com try/catch
- [ ] Retry até 3 vezes se o JSON vier inválido

### Validacao

- [ ] `POST /classificar` com texto positivo, negativo e neutro
- [ ] `POST /classificar` com texto de 3 chars — verificar `400`
- [ ] `POST /classificar/lote` com 5 textos — verificar SSE progressivo
- [ ] Verificar que o JSON retornado sempre tem os 3 campos tipados

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
