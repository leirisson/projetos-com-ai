# 01 — Grafo Linear

Primeiro contato com LangGraph exposto via API Fastify.

**Stack:** Node.js · TypeScript · Fastify · LangGraph.js · OpenRouter SDK
**Conceito:** StateGraph, Annotation, addNode, addEdge, compile, invoke

---

## Descricao

API que gera e-mails em 3 etapas lineares: rascunho → revisão → formatação.
O cliente faz `POST /email` com assunto e tom, e recebe o e-mail final gerado
pelo grafo. Expõe também `POST /email/stream` para acompanhar cada nó em tempo real via SSE.
Objetivo: entender estado, nós e arestas fixas antes de introduzir qualquer complexidade.

---

## Conceitos Ensinados

- `Annotation.Root` para definir o schema do estado
- `reducer` para acumular arrays no estado
- `addNode`, `addEdge` com `START` e `END`
- `compile()` e `invoke()` dentro de uma rota Fastify
- Como o estado é imutável entre nós (nó retorna apenas o delta)

---

## Estrutura do Grafo

```text
[START] → [rascunho] → [revisao] → [formatacao] → [END]
```

---

## Estado

```typescript
const Estado = Annotation.Root({
  assunto:    Annotation<string>(),
  tom:        Annotation<"formal" | "casual">(),
  rascunho:   Annotation<string>(),
  revisado:   Annotation<string>(),
  emailFinal: Annotation<string>(),
  logs:       Annotation<string[]>({ reducer: (a, b) => [...a, ...b] }),
});
```

---

## Contrato da API

```typescript
// POST /email
// Body: { assunto: string, tom: "formal" | "casual" }
// Response: { emailFinal: string, logs: string[], duracaoMs: number }

// POST /email/stream
// Body: { assunto: string, tom: "formal" | "casual" }
// Response: SSE
// data: { no: "rascunho",   status: "iniciou" }
// data: { no: "rascunho",   status: "concluiu", conteudo: "..." }
// data: { no: "revisao",    status: "iniciou" }
// ...
// data: { tipo: "concluido", emailFinal: "..." }
```

---

## Estrutura de Arquivos

```text
01-grafo-linear/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── email.ts           # POST /email e POST /email/stream
│   ├── grafo/
│   │   ├── index.ts           # StateGraph compilado
│   │   ├── state.ts           # Annotation.Root
│   │   └── nos/
│   │       ├── rascunho.ts
│   │       ├── revisao.ts
│   │       └── formatacao.ts
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i fastify @fastify/cors @langchain/langgraph openai dotenv`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`

### Grafo

- [ ] Definir `state.ts` com `Annotation.Root`
- [ ] Implementar `nos/rascunho.ts` — gera rascunho do e-mail
- [ ] Implementar `nos/revisao.ts` — melhora clareza e tom
- [ ] Implementar `nos/formatacao.ts` — formata com assunto, saudação e despedida
- [ ] Montar e compilar o grafo em `grafo/index.ts`

### Rotas

- [ ] `POST /email`: invocar grafo com `grafo.invoke()`, retornar estado final
- [ ] `POST /email/stream`: invocar com `grafo.stream()`, emitir evento SSE por nó

### Validacao

- [ ] `POST /email` com assunto "Solicitar férias" e tom "formal"
- [ ] `POST /email/stream` e verificar que 3 eventos de nó chegam em sequência
- [ ] Verificar que `logs[]` acumula uma entrada por nó

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
