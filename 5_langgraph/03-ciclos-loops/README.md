# 03 — Ciclos e Loops

Refinamento iterativo com grafo cíclico exposto via API Fastify com SSE.

**Stack:** Node.js · TypeScript · Fastify · LangGraph.js · OpenRouter SDK
**Conceito:** Grafos com ciclos, aresta condicional de saída, contador de iterações

---

## Descricao

API de escrita iterativa: o cliente envia um tema via `POST /escrever` e o grafo gera um texto,
avalia a qualidade (score 0–10), e se a nota for menor que 7 reescreve incorporando o feedback —
até 4 tentativas. `POST /escrever/stream` emite cada iteração em tempo real via SSE para o
cliente acompanhar o refinamento acontecendo.

---

## Conceitos Ensinados

- Como criar um ciclo no grafo (aresta de volta para nó anterior)
- Contador de iterações no estado para evitar loops infinitos
- Aresta condicional de saída: `score >= 7 || iteracoes >= 4`
- Diferença entre iterações do grafo e chamadas recursivas

---

## Estrutura do Grafo

```text
[START]
  ↓
[gerar]
  ↓
[avaliar]              → score e feedback
  ↓ condicional
  ├── score >= 7 ou iteracoes >= 4  → [END]
  └── score < 7                    → [refinar] → [gerar]  ← ciclo
```

---

## Contrato da API

```typescript
// POST /escrever
// Body: { tema: string, scoreMinimo?: number }   // scoreMinimo default: 7
// Response: { textoFinal: string, iteracoes: number, scoreFinal: number, historico: Versao[] }

// POST /escrever/stream
// Body: { tema: string }
// Response: SSE
// data: { iteracao: 1, evento: "gerando" }
// data: { iteracao: 1, evento: "avaliando", score: 5.2, feedback: "..." }
// data: { iteracao: 2, evento: "gerando" }
// ...
// data: { evento: "concluido", textoFinal: "...", scoreFinal: 7.8 }
```

---

## Estrutura de Arquivos

```text
03-ciclos-loops/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── escrever.ts
│   ├── grafo/
│   │   ├── index.ts
│   │   ├── state.ts
│   │   └── nos/
│   │       ├── gerar.ts
│   │       ├── avaliar.ts
│   │       └── refinar.ts
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Grafo

- [ ] `state.ts`: `tema`, `texto`, `score`, `feedback`, `iteracoes`, `historico[]`
- [ ] `nos/gerar.ts`: Claude gera texto usando `feedback` do estado se presente
- [ ] `nos/avaliar.ts`: Claude retorna `{ score: number, feedback: string }`
- [ ] `nos/refinar.ts`: incrementa `iteracoes`, empurra versão atual para `historico[]`
- [ ] Função condicional: `score >= 7 || iteracoes >= 4 ? END : "refinar"`

### Rotas

- [ ] `POST /escrever`: `grafo.invoke()`, retornar estado final com histórico
- [ ] `POST /escrever/stream`: `grafo.stream("updates")`, emitir evento SSE por iteração

### Validacao

- [ ] Testar com tema que converge rápido (score alto na 1ª vez)
- [ ] Testar com tema difícil — verificar que para em 4 iterações no máximo
- [ ] No stream, verificar que o score sobe progressivamente entre iterações

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
