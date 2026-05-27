# Sistema RAG de Documentos

Pipeline RAG completo: ingestão de documentos, embeddings, busca vetorial e geração de respostas fundamentadas.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · Claude API | **Nivel:** 3 — Avancado

---

## Descricao

O usuário faz upload de documentos (PDF, TXT, Markdown) via interface Next.js. O sistema ingere os documentos, gera embeddings, armazena no PostgreSQL com extensão `pgvector` e usa busca semântica para recuperar trechos relevantes antes de gerar respostas. Implementação do zero sem LangChain — foco em entender cada peça do pipeline RAG. Usa PostgreSQL pois é a stack mais pedida no mercado BR.

---

## Regras de Negocio

- Cada documento é dividido em chunks de 500 tokens com overlap de 50 tokens.
- A busca retorna os 5 chunks mais relevantes (top-k = 5).
- A resposta deve citar documento de origem e número do chunk para cada afirmação.
- Se nenhum chunk relevante for encontrado (score < 0.7), o sistema informa que não há informação suficiente.
- Documentos já ingeridos não são reprocessados (deduplicação por hash SHA-256).
- O usuário pode remover documentos sem reingerir os demais.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /documentos` — upload e ingestão de arquivo (multipart)
- [ ] RF02 — `GET /documentos` — lista documentos ingeridos com metadados
- [ ] RF03 — `DELETE /documentos/:id` — remove documento e seus chunks do banco
- [ ] RF04 — `POST /chat` — responde pergunta com base nos documentos ingeridos
- [ ] RF05 — `GET /chat/:id/stream` — SSE com resposta em streaming
- [ ] RF06 — Frontend Next.js: área de upload, lista de documentos e interface de chat
- [ ] RF07 — Chat mantém histórico da sessão (multi-turn)

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true` (monorepo: `apps/api` + `apps/web`)
- [ ] RNF02 — PostgreSQL com extensão `pgvector` para armazenamento de embeddings
- [ ] RNF03 — ORM: Prisma com migrations
- [ ] RNF04 — Embeddings via OpenAI `text-embedding-3-small` (1536 dimensões)
- [ ] RNF05 — Chunking respeitando quebras de parágrafo (não cortar frases)
- [ ] RNF06 — Ingestão de 100 páginas em menos de 2 minutos
- [ ] RNF07 — Latência de resposta (busca + geração) menor que 10 segundos
- [ ] RNF08 — Docker Compose com serviço `postgres` + extensão pgvector

---

## Estrutura de Arquivos

```text
sistema-rag/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── ingestor/
│   │   │   │   ├── chunker.ts        # Divisão em chunks com overlap
│   │   │   │   ├── embedder.ts       # Geração de embeddings
│   │   │   │   └── loaders/
│   │   │   │       ├── pdfLoader.ts
│   │   │   │       ├── txtLoader.ts
│   │   │   │       └── mdLoader.ts
│   │   │   ├── retriever.ts          # Busca vetorial no pgvector
│   │   │   ├── generator.ts          # Geração de resposta com contexto
│   │   │   ├── db/
│   │   │   │   ├── schema.prisma     # Prisma schema
│   │   │   │   └── migrations/
│   │   │   └── types.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   └── components/
│       │       ├── DocumentUpload.tsx
│       │       ├── DocumentList.tsx
│       │       └── ChatInterface.tsx
│       ├── tsconfig.json
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Tarefas

### Setup

- [ ] Criar monorepo com `npm workspaces`
- [ ] API — instalar: `fastify @fastify/multipart @anthropic-ai/sdk openai @prisma/client dotenv pdf-parse`
- [ ] Web — criar com `create-next-app` + TailwindCSS
- [ ] Criar `docker-compose.yml` com `pgvector/pgvector:pg16`

### Banco de Dados

- [ ] Criar schema `documentos`, `chunks` com campo `embedding Unsupported("vector(1536)")` no `schema.prisma` e rodar `prisma migrate dev`
- [ ] Criar migration e índice HNSW: `CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)`
- [ ] Implementar `db/` com funções tipadas de insert, select e delete

### Ingestao

- [ ] Implementar loaders para PDF, TXT e Markdown
- [ ] Implementar `chunker.ts` com divisão por tokens e overlap
- [ ] Implementar `embedder.ts` com chamada à OpenAI e batch de 100 chunks por request
- [ ] Implementar deduplicação por SHA-256 antes de processar

### Retrieval e Geracao

- [ ] Implementar `retriever.ts` com busca por similaridade coseno (top-k = 5, score mín. 0.7)
- [ ] Implementar `generator.ts`: monta prompt com chunks numerados + instrução de citação
- [ ] Tratar caso de nenhum chunk relevante

### Frontend (Next.js)

- [ ] `DocumentUpload.tsx`: drag-and-drop ou seleção de arquivo + barra de progresso
- [ ] `DocumentList.tsx`: lista com nome, tamanho, nº de chunks e botão de remoção
- [ ] `ChatInterface.tsx`: input de pergunta, histórico e resposta com citações

### Validacao

- [ ] Ingerir 3 PDFs de temas diferentes e verificar registros no banco
- [ ] Fazer 5 perguntas e verificar que as citações apontam para os documentos corretos
- [ ] Fazer pergunta fora do escopo e verificar mensagem adequada
- [ ] Re-ingerir arquivo existente e verificar que não é duplicado

---

## Como executar

```bash
docker compose up -d     # sobe PostgreSQL com pgvector
npm install

npm run dev -w apps/api  # http://localhost:3001
npm run dev -w apps/web  # http://localhost:3000
```
