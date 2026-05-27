# 08 — Execucao Paralela

Fan-out e fan-in: nós que executam em paralelo e convergem via API Fastify.

**Stack:** Node.js · TypeScript · Fastify · LangGraph.js · OpenRouter SDK
**Conceito:** Send API para fan-out dinâmico, nós paralelos, reducer de fan-in

---

## Descricao

API de análise de produto que executa análises de mercado, técnica e financeira em paralelo
e sintetiza os resultados. `POST /analisar` retorna quando todas as análises concluem.
`POST /analisar/stream` emite cada análise assim que fica pronta, sem esperar as demais.
Demonstra a diferença de tempo: ~15s sequencial vs ~5s paralelo.

---

## Conceitos Ensinados

- `Send` API para fan-out dinâmico (N ramos determinado em runtime)
- Diferença entre fan-out estático (arestas fixas) e dinâmico (`Send`)
- Reducer no estado que agrega resultados quando todos os ramos concluem
- Fan-in: nó `sintetizar` só executa quando todos os ramos terminam

---

## Estrutura do Grafo

```text
[START]
  ↓
[preparar]
  ↓ Send × N   (cada Send dispara um nó "analisar" paralelo)
  ├── [analisar] tipo=mercado
  ├── [analisar] tipo=tecnico
  └── [analisar] tipo=financeiro
          ↓ fan-in (aguarda todos)
       [sintetizar]
          ↓
        [END]
```

---

## Contrato da API

```typescript
// POST /analisar
// Body: { produto: string, tiposAnalise?: string[] }  // default: ["mercado","tecnico","financeiro"]
// Response: { analises: Record<string, string>, sintese: string, duracaoMs: number }

// POST /analisar/stream
// Body: { produto: string }
// Response: SSE — emite cada análise assim que fica pronta
// data: { tipo: "mercado",    conteudo: "...", duracaoMs: 4800 }
// data: { tipo: "financeiro", conteudo: "...", duracaoMs: 5100 }
// data: { tipo: "tecnico",    conteudo: "...", duracaoMs: 5300 }
// data: { tipo: "sintese",    conteudo: "..." }
// data: { tipo: "concluido",  duracaoTotalMs: 5400 }
```

---

## Estrutura de Arquivos

```text
08-paralelo/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── analisar.ts
│   ├── grafo/
│   │   ├── index.ts
│   │   ├── state.ts
│   │   └── nos/
│   │       ├── preparar.ts       # Emite Send para cada tipo de análise
│   │       ├── analisar.ts       # Nó único para todos os tipos
│   │       └── sintetizar.ts
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Grafo

- [ ] `state.ts`: `produto`, `analises: Record<string, string>` com reducer de merge, `sintese`
- [ ] `nos/preparar.ts`: retorna `Send("analisar", { tipo })` para cada tipo — não chama LLM
- [ ] `nos/analisar.ts`: recebe `tipo` no estado e gera análise específica
- [ ] `nos/sintetizar.ts`: recebe `analises` completo e gera síntese
- [ ] Ligar com `addConditionalEdges(preparar, () => [Send(...), Send(...), ...])`

### Rotas

- [ ] `POST /analisar`: `grafo.invoke()`, registrar timestamp de início e fim de cada nó via `streamEvents`
- [ ] `POST /analisar/stream`: `grafo.streamEvents()`, emitir SSE por nó de análise concluído

### Validacao

- [ ] Logar timestamp de início de cada nó de análise — devem diferir < 100ms entre si
- [ ] Testar com `tiposAnalise: ["mercado", "tecnico", "financeiro", "ambiental", "legal"]` — 5 ramos
- [ ] Verificar que `sintetizar` só executa após todos os ramos concluírem

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
