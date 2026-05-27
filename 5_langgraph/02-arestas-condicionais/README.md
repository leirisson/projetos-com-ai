# 02 — Arestas Condicionais

Roteamento dinâmico com `addConditionalEdges` exposto via API Fastify.

**Stack:** Node.js · TypeScript · Fastify · LangGraph.js · OpenRouter SDK
**Conceito:** addConditionalEdges, função de roteamento, múltiplos caminhos

---

## Descricao

API de roteamento de tickets de suporte. O cliente envia um ticket via `POST /ticket`
e o grafo classifica e roteia automaticamente para o especialista correto
(`infraestrutura`, `segurança` ou `desenvolvimento`), que gera a resposta especializada.
`GET /ticket/:id` retorna o resultado e qual caminho o grafo percorreu.

---

## Conceitos Ensinados

- `addConditionalEdges(noOrigem, funcaoRoteamento, mapaDestinos)`
- Função de roteamento retorna string que mapeia para um nó de destino
- Como múltiplos nós convergem para um nó comum (`gerarResposta`)
- Diferença entre aresta fixa (`addEdge`) e condicional

---

## Estrutura do Grafo

```text
[START]
  ↓
[classificar]           → "infra" | "seguranca" | "dev"
  ↓ condicional
  ├── "infra"     → [especialistaInfra]
  ├── "seguranca" → [especialistaSeguranca]
  └── "dev"       → [especialistaDev]
                              ↓
                      [gerarResposta]
                              ↓
                            [END]
```

---

## Contrato da API

```typescript
// POST /ticket
// Body: { descricao: string }
// Response: { id: string }   ← processamento assíncrono

// GET /ticket/:id
// Response: {
//   status: "processando" | "concluido",
//   categoria: "infra" | "seguranca" | "dev",
//   caminhoPercorrido: string[],
//   resposta: string
// }
```

---

## Estrutura de Arquivos

```text
02-arestas-condicionais/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── ticket.ts
│   ├── grafo/
│   │   ├── index.ts
│   │   ├── state.ts
│   │   └── nos/
│   │       ├── classificar.ts
│   │       ├── especialistas.ts   # Os 3 especialistas em um arquivo
│   │       └── gerarResposta.ts
│   ├── store.ts                   # Map em memória: id → estado do ticket
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Grafo

- [ ] `state.ts` com campos: `ticket`, `categoria`, `analise`, `resposta`, `caminhoPercorrido`
- [ ] `nos/classificar.ts`: Claude retorna JSON `{ categoria }`
- [ ] `nos/especialistas.ts`: função única com switch em `categoria`
- [ ] `nos/gerarResposta.ts`: usa `analise` do especialista para redigir resposta
- [ ] `addConditionalEdges` mapeando categoria → nó especialista

### Rotas e Store

- [ ] `store.ts`: `Map<string, TicketState>` simples para armazenar estados por ID
- [ ] `POST /ticket`: gera UUID, dispara `grafo.invoke()` em background, retorna `{ id }`
- [ ] `GET /ticket/:id`: lê do store, retorna estado atual

### Validacao

- [ ] Enviar ticket de infraestrutura — verificar `caminhoPercorrido` inclui `especialistaInfra`
- [ ] Enviar ticket de segurança — verificar que nunca passa por `especialistaDev`
- [ ] Verificar que `GET /ticket/:id` retorna `processando` antes de concluir

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
