# 04 — Checkpointing

Persistência de estado no PostgreSQL para retomar sessões onde pararam.

**Stack:** Node.js · TypeScript · LangGraph.js · PostgreSQL · Claude API
**Conceito:** MemorySaver / PostgresSaver, thread_id, retomada de execução

---

## Descricao

Assistente de planejamento de viagem que lembra de tudo que foi discutido em sessões anteriores.
Na primeira sessão o usuário define destino e datas. Na segunda, adiciona preferências. Na terceira,
pede o roteiro final — e o assistente lembra de tudo. Demonstra que o checkpointing não é apenas
cache: é a base para workflows de longa duração que podem ser pausados e retomados.

---

## Conceitos Ensinados

- `MemorySaver` (in-memory) vs `PostgresSaver` (persistente)
- `thread_id` como identificador de sessão
- `configurable: { thread_id }` ao invocar o grafo
- `grafo.getState(config)` para inspecionar o estado atual
- `grafo.updateState(config, delta)` para injetar dados externos

---

## Estrutura do Grafo

```text
[START]
  ↓
[processarMensagem]     → acumula mensagens, chama Claude com histórico completo
  ↓
[END]
```

O grafo é simples — a complexidade está no checkpointing, não no fluxo.

---

## Tarefas

### Com MemorySaver (passo 1 — sem banco)

- [ ] Implementar grafo com `MemorySaver`
- [ ] Estado com `mensagens[]` acumuladas
- [ ] Verificar que sessão A e sessão B têm históricos independentes via `thread_id`

### Com PostgresSaver (passo 2 — persistente)

- [ ] Docker Compose com PostgreSQL
- [ ] Instalar: `@langchain/langgraph-checkpoint-postgres`
- [ ] Substituir `MemorySaver` por `PostgresSaver`
- [ ] Testar: rodar processo, matar, reiniciar e verificar que histórico persiste
- [ ] `grafo.getState(config)` para inspecionar estado entre execuções

### Validacao

- [ ] Sessão 1: "Quero ir a Lisboa em julho"
- [ ] Encerrar processo
- [ ] Sessão 2 (novo processo, mesmo thread_id): "Prefiro hotéis boutique"
- [ ] Sessão 3: "Monte o roteiro de 5 dias" — assistente deve lembrar Lisboa e julho

---

## Como executar

```bash
docker compose up -d && npm install
npx tsx src/index.ts --thread minha-viagem
```
