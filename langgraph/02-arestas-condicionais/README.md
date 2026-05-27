# 02 — Arestas Condicionais

Roteamento dinâmico com `addConditionalEdges` baseado no estado.

**Stack:** Node.js · TypeScript · LangGraph.js · Claude API
**Conceito:** addConditionalEdges, função de roteamento, múltiplos caminhos

---

## Descricao

Classificador de suporte técnico que roteia um ticket para o time correto:
`infraestrutura`, `segurança` ou `desenvolvimento`. O nó de classificação
analisa o ticket com Claude e retorna uma categoria. A aresta condicional
direciona para o nó especialista correspondente. Objetivo: dominar roteamento
dinâmico antes de introduzir ciclos.

---

## Conceitos Ensinados

- `addConditionalEdges(noOrigem, funcaoRoteamento, mapaDestinos)`
- Função de roteamento retorna uma string que mapeia para um nó
- Como múltiplos nós podem convergir para um nó comum
- Diferença entre aresta fixa (`addEdge`) e condicional

---

## Estrutura do Grafo

```text
[START]
  ↓
[classificar]           → retorna: "infra" | "seguranca" | "dev"
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

## Tarefas

- [ ] Definir estado com `ticket`, `categoria`, `analise`, `resposta`
- [ ] Nó `classificar`: Claude retorna JSON `{ categoria: "infra"|"seguranca"|"dev" }`
- [ ] Nós especialistas: cada um adiciona contexto específico ao estado
- [ ] Nó `gerarResposta`: usa a análise do especialista para redigir a resposta
- [ ] Implementar `addConditionalEdges` com mapa de categorias → nós
- [ ] Testar com 3 tickets, um de cada categoria
- [ ] Verificar que tickets de segurança nunca passam pelo especialista de infra

---

## Como executar

```bash
npm install
npx tsx src/index.ts
```
