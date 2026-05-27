# 01 — Assistente de Documentacao Tecnica

Pipeline RAG básico com chunking semântico e busca híbrida sobre documentação técnica.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** Chunking por seção + busca híbrida (semântica + full-text)
**Topico LangGraph:** Grafo linear com 4 nós (ingest → embed → retrieve → generate)

---

## Descricao

O usuário carrega a documentação de uma biblioteca ou framework (em Markdown/MDX) e pode fazer perguntas sobre como usá-la. O sistema divide os documentos por seções (h2/h3), gera embeddings e usa busca híbrida combinando similaridade vetorial com full-text search do PostgreSQL para lidar bem com buscas por nomes exatos de funções e métodos.

---

## Regras de Negocio

- Cada arquivo `.md` é dividido por headings H2 e H3 (não por número fixo de tokens).
- Seções menores que 100 tokens são mergeadas com a seção seguinte.
- A busca híbrida combina score vetorial (70%) e score full-text (30%) via Reciprocal Rank Fusion.
- Respostas devem citar o arquivo de origem e o heading da seção.
- Documentação já indexada não é reprocessada (hash por arquivo).

---

## Requisitos Funcionais

- [ ] RF01 — `POST /documentos` — upload de arquivo `.md` ou `.mdx`
- [ ] RF02 — `GET /documentos` — lista documentos com nº de chunks
- [ ] RF03 — `DELETE /documentos/:id` — remove documento e chunks
- [ ] RF04 — `POST /perguntar` — recebe pergunta, executa grafo LangGraph e retorna resposta
- [ ] RF05 — `GET /perguntar/:id/stream` — SSE com execução do grafo em tempo real
- [ ] RF06 — Frontend Next.js: upload, lista de docs e interface de chat com fontes

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript `strict: true` (monorepo `apps/api` + `apps/web`)
- [ ] RNF02 — LangGraph.js para orquestrar o pipeline de resposta
- [ ] RNF03 — PostgreSQL + `pgvector` + `pg_trgm` para busca híbrida
- [ ] RNF04 — ORM Prisma com migrations
- [ ] RNF05 — Embeddings: OpenAI `text-embedding-3-small`

---

## Grafo LangGraph

```text
[START]
  ↓
[analisarPergunta]     → extrai intenção e keywords da pergunta
  ↓
[buscarDocumentos]     → busca híbrida: top-20 vetorial + top-20 full-text → RRF → top-5
  ↓
[gerarResposta]        → Claude gera resposta com os 5 chunks como contexto
  ↓
[END]
```

---

## Estrutura de Arquivos

```text
01-documentacao-tecnica/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── grafo/
│   │   │   │   ├── index.ts          # Definição do StateGraph
│   │   │   │   ├── state.ts          # Tipo do estado do grafo
│   │   │   │   └── nos/
│   │   │   │       ├── analisarPergunta.ts
│   │   │   │       ├── buscarDocumentos.ts
│   │   │   │       └── gerarResposta.ts
│   │   │   ├── ingestor/
│   │   │   │   ├── mdChunker.ts      # Chunking por heading
│   │   │   │   └── embedder.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   └── migrations/
│   │   │   └── types.ts
│   │   └── package.json
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   └── components/
│       │       ├── DocUpload.tsx
│       │       ├── DocList.tsx
│       │       └── Chat.tsx
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Tarefas

### Setup

- [ ] Criar monorepo com `npm workspaces`
- [ ] API: `npm i @langchain/langgraph openai @prisma/client fastify dotenv`
- [ ] Web: `create-next-app` + TailwindCSS
- [ ] `docker-compose.yml` com `pgvector/pgvector:pg16`

### Banco

- [ ] Schema: tabelas `documentos`, `chunks` com `embedding vector(1536)` e campo `conteudo_tsv tsvector`
- [ ] Trigger para popular `conteudo_tsv` automaticamente (full-text index)
- [ ] Índice HNSW no campo embedding
- [ ] Índice GIN no campo `conteudo_tsv`

### Ingestao

- [ ] `mdChunker.ts`: dividir por H2/H3, mergear seções < 100 tokens
- [ ] `embedder.ts`: gerar embeddings em batch, salvar no banco
- [ ] Deduplicação por hash SHA-256

### Implementar Grafo

- [ ] Definir `GrafoState` em `state.ts` com campos: `pergunta`, `keywords`, `chunks`, `resposta`
- [ ] Nó `analisarPergunta`: extrai keywords para o full-text search
- [ ] Nó `buscarDocumentos`: executa busca vetorial + full-text, aplica RRF, retorna top-5
- [ ] Nó `gerarResposta`: monta prompt com chunks e gera resposta com streaming
- [ ] Montar `StateGraph` em `index.ts` e compilar

### API e Frontend

- [ ] Rota `POST /perguntar` que invoca o grafo e retorna via SSE
- [ ] Frontend: upload, lista e chat com indicação dos chunks usados

### Validacao

- [ ] Carregar documentação do Fastify em MD e fazer 5 perguntas
- [ ] Testar busca por nome exato de método (ex: `reply.send`) — deve retornar via full-text
- [ ] Testar busca semântica (ex: "como retornar JSON") — deve retornar via embedding
- [ ] Verificar RRF combinando os dois scores

---

## Como executar

```bash
docker compose up -d
npm install
npm run dev -w apps/api   # http://localhost:3001
npm run dev -w apps/web   # http://localhost:3000
```
