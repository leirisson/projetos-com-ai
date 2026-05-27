# 08 — Execucao Paralela

Fan-out e fan-in: nós que executam em paralelo e convergem para um nó de síntese.

**Stack:** Node.js · TypeScript · LangGraph.js · Claude API
**Conceito:** Send API para fan-out dinâmico, nós paralelos, reducer de fan-in

---

## Descricao

Analisador de produto que roda três análises em paralelo (mercado, técnica e financeira) e depois
sintetiza os resultados. Sem paralelismo, as 3 análises rodariam em sequência: ~15s. Com fan-out
paralelo, rodam simultaneamente: ~5s. Demonstra como o LangGraph gerencia a execução concorrente
e como o reducer do estado agrega os resultados quando todos os ramos convergem.

---

## Conceitos Ensinados

- `Send` API para fan-out dinâmico (número de ramos determinado em runtime)
- Diferença entre fan-out estático (arestas fixas) e dinâmico (`Send`)
- Reducer no estado que aguarda todos os ramos antes de liberar o próximo nó
- Fan-in: nó `sintetizar` só executa quando todos os ramos concluem

---

## Estrutura do Grafo (Fan-out Estatico)

```text
[START]
  ↓
[preparar]
  ↓ (3 arestas paralelas)
  ├── [analisarMercado]
  ├── [analisarTecnico]
  └── [analisarFinanceiro]
          ↓ (fan-in: espera os 3)
       [sintetizar]
          ↓
        [END]
```

---

## Tarefas

### Fan-out Estatico

- [ ] Estado com `analises: Record<string, string>` e reducer que faz merge
- [ ] Adicionar as 3 arestas paralelas saindo de `preparar`
- [ ] Verificar que `sintetizar` só executa quando os 3 estão prontos
- [ ] Medir tempo total e comparar com execução sequencial

### Fan-out Dinamico com Send

- [ ] Modificar para usar `Send("analisar", { tipo, dados })` com N ramos dinâmicos
- [ ] Nó `analisar` recebe `tipo` no estado e aplica o prompt correto
- [ ] Testar com 5 análises em vez de 3 sem mudar o código do grafo

### Validacao

- [ ] Logar timestamp de início e fim de cada nó
- [ ] Verificar que os 3 (ou N) nós iniciam quase simultaneamente
- [ ] Verificar que `sintetizar` recebe todos os resultados corretamente

---

## Como executar

```bash
npm install
npx tsx src/index.ts
```
