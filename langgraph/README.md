# LangGraph — Conceitos e Projetos

Projetos focados exclusivamente nos padrões e conceitos do LangGraph.js, independente de RAG.

**Stack base:** Node.js · TypeScript · LangGraph.js · Claude API

---

## O que e LangGraph

LangGraph é um framework para construir fluxos agênticos como **grafos de estado**.
Cada nó é uma função TypeScript pura, as arestas definem transições (fixas ou condicionais),
e o estado é tipado com um schema definido pelo desenvolvedor.

### Por que usar LangGraph em vez de chamar a API diretamente

| Sem LangGraph | Com LangGraph |
| ------------- | ------------- |
| Lógica de loop manual com `while` | Ciclos declarativos no grafo |
| Estado espalhado em variáveis locais | Estado tipado e centralizado |
| Difícil de pausar e retomar | Checkpointing nativo |
| Streaming manual do loop | Streaming por evento de nó |
| Difícil testar nós isolados | Cada nó é função pura testável |

---

## Anatomia de um Grafo

```typescript
import { StateGraph, END, START } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";

// 1. Definir o estado
const Estado = Annotation.Root({
  mensagens: Annotation<string[]>({ reducer: (a, b) => [...a, ...b] }),
  resultado: Annotation<string>(),
});

// 2. Definir os nós (funções puras)
async function noA(estado: typeof Estado.State) {
  return { mensagens: ["processado por A"] };
}

async function noB(estado: typeof Estado.State) {
  return { resultado: "finalizado" };
}

// 3. Montar o grafo
const grafo = new StateGraph(Estado)
  .addNode("noA", noA)
  .addNode("noB", noB)
  .addEdge(START, "noA")
  .addEdge("noA", "noB")
  .addEdge("noB", END)
  .compile();

// 4. Invocar
const resultado = await grafo.invoke({ mensagens: [], resultado: "" });
```

---

## Conceitos Cobertos por Projeto

| # | Projeto | Conceito Principal |
|---|---------|-------------------|
| 1 | [Grafo Linear](./01-grafo-linear/) | Nós, arestas, estado, invoke |
| 2 | [Arestas Condicionais](./02-arestas-condicionais/) | `addConditionalEdges`, roteamento |
| 3 | [Ciclos e Loops](./03-ciclos-loops/) | Grafos cíclicos, contador de iterações |
| 4 | [Checkpointing](./04-checkpointing/) | Persistência de estado, retomada de sessão |
| 5 | [Streaming por No](./05-streaming/) | Streaming de eventos por nó com SSE |
| 6 | [Subgrafos](./06-subgrafos/) | Composição de grafos, nó que invoca outro grafo |
| 7 | [Human in the Loop](./07-human-in-the-loop/) | Pausa para aprovação humana, `interrupt()` |
| 8 | [Execucao Paralela](./08-paralelo/) | Nós paralelos, fan-out, fan-in |
| 9 | [Agente com Tool Use](./09-agente-tool-use/) | Agentic loop com ferramentas e Claude |
| 10 | [Multi-Agente](./10-multi-agente/) | Grafos que coordenam múltiplos sub-agentes |

---

## Como os Conceitos se Relacionam

```text
Projeto 1 (linear)          ← base: entender estado e nós
    ↓
Projeto 2 (condicional)     ← roteamento dinâmico
    ↓
Projeto 3 (ciclos)          ← loops agênticos
    ↓
Projeto 4 (checkpoint)      ← persistência entre execuções
    ↓
Projeto 7 (human-in-loop)   ← pausa + retomada com input humano
    ↓
Projeto 9 (agente)          ← combina tudo: loop + ferramentas + checkpoint
    ↓
Projeto 10 (multi-agente)   ← orquestração de múltiplos agentes especializados
```

---

## Diferenca entre rag-langgraph/ e langgraph/

| Pasta | Foco |
| ----- | ---- |
| `rag-langgraph/` | Sistemas RAG completos que usam LangGraph como orquestrador |
| `langgraph/` | Padrões e conceitos do LangGraph isolados (sem RAG) |

Use `langgraph/` para aprender os conceitos do framework.
Use `rag-langgraph/` para ver esses conceitos aplicados em sistemas reais de RAG.
