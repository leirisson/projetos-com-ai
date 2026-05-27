# 01 — Grafo Linear

Primeiro contato com LangGraph: estado, nós, arestas fixas e invoke.

**Stack:** Node.js · TypeScript · LangGraph.js · Claude API
**Conceito:** StateGraph, Annotation, addNode, addEdge, compile, invoke

---

## Descricao

Pipeline de geração de e-mail em 3 etapas lineares: rascunho → revisão → formatação.
Cada etapa é um nó separado. O estado acumula o progresso. Nenhuma condicional — fluxo sempre
percorre os 3 nós em ordem. Objetivo: entender a estrutura básica do LangGraph antes de
introduzir qualquer complexidade.

---

## Conceitos Ensinados

- `Annotation.Root` para definir o schema do estado
- `reducer` para acumular arrays no estado
- `addNode` com função assíncrona
- `addEdge` com `START` e `END`
- `compile()` e `invoke()`
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
  assunto:   Annotation<string>(),
  tom:       Annotation<"formal" | "casual">(),
  rascunho:  Annotation<string>(),
  revisado:  Annotation<string>(),
  emailFinal: Annotation<string>(),
  logs:      Annotation<string[]>({ reducer: (a, b) => [...a, ...b] }),
});
```

---

## Tarefas

- [ ] Instalar: `@langchain/langgraph @anthropic-ai/sdk dotenv`
- [ ] Definir `Estado` com `Annotation.Root`
- [ ] Implementar nó `rascunho(estado)` — gera rascunho do e-mail
- [ ] Implementar nó `revisao(estado)` — melhora clareza e tom do rascunho
- [ ] Implementar nó `formatacao(estado)` — formata com assunto, saudação e despedida
- [ ] Montar grafo e compilar
- [ ] Testar com `invoke({ assunto: "Solicitar férias", tom: "formal" })`
- [ ] Imprimir o estado completo ao final e verificar `logs[]` acumulados

---

## Como executar

```bash
npm install
npx tsx src/index.ts
```
