# 06 — Subgrafos

Composição de grafos: um grafo pai que invoca subgrafos especializados como nós.

**Stack:** Node.js · TypeScript · LangGraph.js · Claude API
**Conceito:** Subgrafos como nós, mapeamento de estado pai ↔ filho, composição modular

---

## Descricao

Sistema de geração de relatório executivo com três subgrafos independentes que rodam em
sequência: `subgrafoFinanceiro`, `subgrafoOperacional` e `subgrafoEstrategico`. Cada subgrafo
tem seu próprio estado interno, processa seus dados e retorna apenas o output necessário para
o grafo pai. Objetivo: aprender a decompor grafos complexos em unidades testáveis e reutilizáveis.

---

## Conceitos Ensinados

- Compilar um subgrafo com `.compile()` e usá-lo como nó em outro grafo
- Mapeamento de estado: transformar o estado do pai antes de invocar o filho
- O subgrafo não enxerga o estado completo do pai — só o que é mapeado
- Como testar subgrafos isoladamente antes de compor

---

## Estrutura do Grafo

```text
GrafoPai:
[START]
  ↓
[coletarDados]
  ↓
[subgrafoFinanceiro]    ← grafo compilado separado
  ↓
[subgrafoOperacional]   ← grafo compilado separado
  ↓
[subgrafoEstrategico]   ← grafo compilado separado
  ↓
[montarRelatorio]
  ↓
[END]

SubgrafoFinanceiro:
[START] → [calcularKPIs] → [identificarAnomalias] → [END]
```

---

## Tarefas

### Subgrafos

- [ ] Criar `subgrafos/financeiro.ts` com estado próprio e compilar
- [ ] Criar `subgrafos/operacional.ts` com estado próprio e compilar
- [ ] Criar `subgrafos/estrategico.ts` com estado próprio e compilar
- [ ] Testar cada subgrafo isoladamente com `invoke`

### Grafo Pai

- [ ] Usar subgrafos compilados como nós: `grafoPai.addNode("financeiro", subgrafoFinanceiro)`
- [ ] Implementar mapeamento de estado: função que extrai do estado pai apenas o necessário
- [ ] Nó `montarRelatorio`: combina os outputs dos 3 subgrafos em markdown

### Validacao

- [ ] Verificar que alterar o subgrafo financeiro não quebra os outros
- [ ] Invocar o subgrafo financeiro diretamente e via grafo pai — mesmo resultado
- [ ] Imprimir estado após cada subgrafo para verificar o mapeamento

---

## Como executar

```bash
npm install
npx tsx src/index.ts
```
