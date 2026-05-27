# 06 — Subgrafos

Composição de grafos: grafo pai que invoca subgrafos especializados como nós.

**Stack:** Node.js · TypeScript · Fastify · LangGraph.js · OpenRouter SDK
**Conceito:** Subgrafos como nós, mapeamento de estado pai ↔ filho, composição modular

---

## Descricao

API que gera relatórios executivos compostos por 3 seções independentes.
Cada seção é produzida por um subgrafo especializado (financeiro, operacional, estratégico)
que tem seu próprio estado interno. O grafo pai orquestra a sequência e consolida os resultados.
`POST /relatorio/stream` emite cada seção concluída via SSE conforme o grafo avança.

---

## Conceitos Ensinados

- Compilar subgrafo e usá-lo como nó: `grafoPai.addNode("financeiro", subgrafoFinanceiro)`
- Mapeamento de estado: função que extrai do estado pai apenas o que o filho precisa
- Subgrafo não enxerga o estado completo do pai
- Testar subgrafos isoladamente antes de compor

---

## Estrutura do Grafo

```text
GrafoPai:
[START] → [coletarDados] → [subgrafoFinanceiro] → [subgrafoOperacional] → [subgrafoEstrategico] → [consolidar] → [END]

SubgrafoFinanceiro:
[START] → [calcularKPIs] → [identificarAnomalias] → [END]
```

---

## Contrato da API

```typescript
// POST /relatorio
// Body: { empresa: string, periodo: string }
// Response: { financeiro: string, operacional: string, estrategico: string, executivo: string }

// POST /relatorio/stream
// Response: SSE
// data: { secao: "financeiro",   conteudo: "..." }
// data: { secao: "operacional",  conteudo: "..." }
// data: { secao: "estrategico",  conteudo: "..." }
// data: { secao: "executivo",    conteudo: "..." }
// data: { tipo: "concluido" }
```

---

## Estrutura de Arquivos

```text
06-subgrafos/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── relatorio.ts
│   ├── grafo/
│   │   ├── index.ts               # Grafo pai
│   │   ├── state.ts               # Estado do grafo pai
│   │   └── subgrafos/
│   │       ├── financeiro.ts      # Subgrafo compilado
│   │       ├── operacional.ts
│   │       └── estrategico.ts
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Subgrafos

- [ ] Criar `subgrafos/financeiro.ts` com estado próprio (`kpis`, `anomalias`) e compilar
- [ ] Criar `subgrafos/operacional.ts` e `estrategico.ts` da mesma forma
- [ ] Testar cada subgrafo isoladamente com `subgrafo.invoke()`

### Grafo Pai

- [ ] `state.ts`: `empresa`, `periodo`, `dadosColetados`, `financeiro`, `operacional`, `estrategico`, `executivo`
- [ ] Adicionar subgrafos como nós com `grafoPai.addNode("financeiro", subgrafoFinanceiro)`
- [ ] Implementar mapeamento de estado para cada subgrafo
- [ ] Nó `consolidar`: combina as 3 seções em sumário executivo

### Rotas

- [ ] `POST /relatorio`: `grafo.invoke()`, retornar estado final
- [ ] `POST /relatorio/stream`: `grafo.stream("updates")`, emitir evento SSE por subgrafo concluído

### Validacao

- [ ] Invocar subgrafo financeiro diretamente e via grafo pai — resultado deve ser equivalente
- [ ] No stream, verificar que os 3 eventos chegam em sequência
- [ ] Alterar subgrafo operacional — verificar que os outros não são afetados

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
