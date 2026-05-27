# 02 — Chatbot Juridico com Reranking

RAG com reranking por cross-encoder para alta precisão em domínio jurídico.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** Reranking com cross-encoder após busca vetorial
**Topico LangGraph:** Nó de reranking condicional — se score médio < threshold, busca mais

---

## Descricao

Sistema de perguntas e respostas sobre contratos e documentos jurídicos. A busca vetorial tem alta recall mas baixa precision — retorna documentos parecidos mas nem sempre os mais relevantes. O reranking usa um modelo cross-encoder para reordenar os candidatos com base na pergunta exata, resultando em respostas muito mais precisas. O grafo LangGraph decide se o contexto recuperado é suficiente antes de gerar a resposta.

---

## Regras de Negocio

- Busca vetorial retorna top-20 candidatos (alta recall).
- Cross-encoder reordena os 20 e retorna os top-5 (alta precision).
- Se o score médio dos top-5 for menor que 0.6, o nó de avaliação expande a busca para top-40.
- Respostas devem indicar o documento e a cláusula de origem.
- O sistema não deve inventar interpretações jurídicas — apenas citar o texto encontrado.

---

## Requisitos Funcionais

- [ ] RF01 — Upload de contratos PDF e documentos jurídicos em TXT/MD
- [ ] RF02 — `POST /perguntar` — executa grafo com reranking e retorna resposta
- [ ] RF03 — Resposta inclui os trechos exatos dos documentos utilizados
- [ ] RF04 — `GET /perguntar/:id/stream` — SSE com passos do grafo em tempo real
- [ ] RF05 — Frontend Next.js: upload, chat e painel com trechos recuperados destacados

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Cross-encoder: `cross-encoder/ms-marco-MiniLM-L-6-v2` via Hugging Face Inference API
- [ ] RNF02 — Fallback: se a API do HF estiver indisponível, usar apenas busca vetorial
- [ ] RNF03 — Grafo LangGraph com nó condicional baseado em score de relevância
- [ ] RNF04 — Logging de scores antes e depois do reranking para comparação

---

## Grafo LangGraph

```text
[START]
  ↓
[buscarCandidatos]      → top-20 por similaridade vetorial
  ↓
[rerankar]              → cross-encoder reordena, retorna top-5 com scores
  ↓
[avaliarRelevancia]     → score médio < 0.6?
  ↓ sim                 ↓ não
[expandirBusca]    [gerarResposta]
  ↓
[rerankar]
  ↓
[gerarResposta]
  ↓
[END]
```

---

## Tarefas

### Setup

- [ ] Monorepo + PostgreSQL pgvector via Docker
- [ ] Instalar: `@langchain/langgraph @anthropic-ai/sdk openai drizzle-orm pg fastify`

### Reranking

- [ ] Implementar `reranker.ts` com chamada à Hugging Face Inference API
- [ ] Interface `RerankResult` com `{ chunk, score: number }`
- [ ] Implementar fallback quando API indisponível

### Grafo

- [ ] Estado: `candidatos`, `reranked`, `scoresMedio`, `resposta`
- [ ] Nó `avaliarRelevancia` retorna `"expandir"` ou `"gerar"` como edge condicional
- [ ] Nó `expandirBusca` dobra o top-k e repassa pelo reranker

### Validacao

- [ ] Comparar qualidade das respostas com e sem reranking
- [ ] Logar scores antes/depois e verificar melhora
- [ ] Testar expansão automática com pergunta de nicho

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
