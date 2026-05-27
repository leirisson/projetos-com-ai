# 04 — Checkpointing

Persistência de estado com PostgresSaver para retomar conversas entre requisições.

**Stack:** Node.js · TypeScript · Fastify · LangGraph.js · PostgreSQL · OpenRouter SDK
**Conceito:** MemorySaver / PostgresSaver, thread_id, retomada de execução

---

## Descricao

API de assistente de viagem onde cada sessão tem um `threadId` e o estado da conversa
é persistido no PostgreSQL. O cliente envia `POST /conversa/:threadId` com uma mensagem
e o assistente responde com memória de toda a conversa anterior — mesmo após reiniciar o servidor.
`GET /conversa/:threadId` mostra o histórico completo salvo.

---

## Conceitos Ensinados

- `MemorySaver` (in-memory) vs `PostgresSaver` (persistente entre processos)
- `thread_id` como chave de sessão passado via `configurable`
- `grafo.getState(config)` para inspecionar o estado entre requisições
- `grafo.invoke(null, config)` para retomar execução com estado existente

---

## Estrutura do Grafo

```text
[START]
  ↓
[processarMensagem]     → adiciona mensagem, chama LLM com histórico completo
  ↓
[END]
```

---

## Contrato da API

```typescript
// POST /conversa/:threadId
// Body: { mensagem: string }
// Response: { resposta: string, threadId: string, totalMensagens: number }

// GET /conversa/:threadId
// Response: { mensagens: Message[], threadId: string }

// DELETE /conversa/:threadId
// Response: { ok: true }
```

---

## Estrutura de Arquivos

```text
04-checkpointing/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── conversa.ts
│   ├── grafo/
│   │   ├── index.ts          # Grafo compilado com PostgresSaver
│   │   └── state.ts
│   └── db.ts                 # Inicialização do PostgresSaver
├── docker-compose.yml
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i fastify @langchain/langgraph @langchain/langgraph-checkpoint-postgres openai pg dotenv`
- [ ] `docker-compose.yml` com PostgreSQL 16

### Grafo

- [ ] `state.ts`: `mensagens[]` com reducer de acúmulo
- [ ] `nos/processarMensagem.ts`: chama LLM com histórico completo do estado
- [ ] `db.ts`: inicializa `PostgresSaver` e chama `.setup()` na subida do servidor

### Rotas

- [ ] `POST /conversa/:threadId`: `grafo.invoke()` com `configurable: { thread_id }`
- [ ] `GET /conversa/:threadId`: `grafo.getState()` e retornar mensagens
- [ ] `DELETE /conversa/:threadId`: apagar estado do banco

### Validacao

- [ ] Enviar 3 mensagens em sequência — verificar que o assistente lembra das anteriores
- [ ] Parar o servidor, reiniciar, enviar nova mensagem — histórico deve persistir
- [ ] Dois `threadId` diferentes — verificar isolamento de histórico

---

## Como executar

```bash
docker compose up -d
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
