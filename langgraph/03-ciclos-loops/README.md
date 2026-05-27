# 03 — Ciclos e Loops

Grafos cíclicos para refinamento iterativo com contador de iterações.

**Stack:** Node.js · TypeScript · LangGraph.js · Claude API
**Conceito:** Grafos com ciclos, aresta condicional de saída, contador de iterações no estado

---

## Descricao

Sistema de escrita iterativa: gera um texto, avalia a qualidade (score 0-10), e se a nota for menor
que 7 reescreve incorporando o feedback — até 4 tentativas. Demonstra o padrão de loop
mais fundamental do LangGraph: gerar → avaliar → continuar ou parar.

---

## Conceitos Ensinados

- Como criar um ciclo: aresta de um nó posterior de volta a um nó anterior
- Contador de iterações no estado para evitar loops infinitos
- Aresta condicional de saída: `score >= 7 || iteracoes >= 4`
- Diferença entre `iteracoes` e profundidade de recursão

---

## Estrutura do Grafo

```text
[START]
  ↓
[gerar]
  ↓
[avaliar]              → retorna score e feedback
  ↓ condicional
  ├── score >= 7 ou iteracoes >= 4  → [END]
  └── score < 7                    → [refinar]
                                         ↓
                                      [gerar]  ← ciclo
```

---

## Tarefas

- [ ] Estado com `tema`, `texto`, `score`, `feedback`, `iteracoes`, `historico[]`
- [ ] Nó `gerar`: Claude gera texto, usa `feedback` do estado se não for nulo
- [ ] Nó `avaliar`: Claude retorna `{ score: number, feedback: string }`
- [ ] Nó `refinar`: incrementa `iteracoes`, prepara instrução de reescrita
- [ ] Função condicional: `score >= 7 || iteracoes >= 4 ? END : "refinar"`
- [ ] Acumular todas as versões em `historico[]` para comparação
- [ ] Testar com tema difícil que exija múltiplas iterações
- [ ] Imprimir score de cada iteração ao final

---

## Como executar

```bash
npm install
npx tsx src/index.ts
```
