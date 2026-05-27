# 05 — Streaming por No

Streaming de eventos do grafo em tempo real via SSE para o frontend.

**Stack:** Node.js · TypeScript · Fastify · Next.js · LangGraph.js · Claude API
**Conceito:** grafo.stream(), streamEvents(), SSE no Fastify, consumo no Next.js

---

## Descricao

Pipeline de análise de notícias com 4 nós (buscar → resumir → classificar → concluir) onde o
frontend exibe em tempo real qual nó está executando e o output parcial de cada um.
Demonstra a diferença entre `stream("values")` (estado completo a cada nó) e `streamEvents()`
(eventos granulares incluindo tokens da LLM).

---

## Conceitos Ensinados

- `grafo.stream(input, config, { streamMode: "values" | "updates" | "debug" })`
- `grafo.streamEvents(input, config, { version: "v2" })`
- Filtrar eventos por `event` e `metadata.langgraph_node`
- Transmitir como SSE do Fastify com `reply.raw.write()`
- Consumir SSE no Next.js com `EventSource` ou `fetch` + `ReadableStream`

---

## Estrutura do Grafo

```text
[START] → [buscar] → [resumir] → [classificar] → [concluir] → [END]
```

---

## Eventos SSE emitidos

```text
data: { tipo: "no_iniciou",   no: "buscar"      }
data: { tipo: "token",        no: "resumir",     token: "A notícia" }
data: { tipo: "token",        no: "resumir",     token: " trata de..." }
data: { tipo: "no_concluiu",  no: "resumir",     duracao: 2.3 }
data: { tipo: "no_iniciou",   no: "classificar"  }
...
data: { tipo: "grafo_concluiu", estado: {...}    }
```

---

## Tarefas

### Backend (Fastify)

- [ ] Rota `POST /analisar` que inicia o grafo e retorna `{ id }`
- [ ] Rota `GET /analisar/:id/stream` que emite SSE dos eventos do grafo
- [ ] Usar `streamEvents` para capturar tokens individuais da LLM
- [ ] Normalizar eventos para o formato definido acima

### Frontend (Next.js)

- [ ] Input de URL de notícia
- [ ] Painel com 4 cards (um por nó) que acendem conforme executam
- [ ] Texto aparece progressivamente dentro do card do nó ativo
- [ ] Indicador de tempo por nó após conclusão

### Validacao

- [ ] Verificar que os tokens aparecem progressivamente (não em bloco)
- [ ] Verificar que o card do nó correto está ativo a cada momento
- [ ] Verificar que eventos de nós diferentes não se misturam

---

## Como executar

```bash
npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
