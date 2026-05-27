# Assistente com Memoria Persistente

Assistente conversacional com memória de longo prazo e perfil de usuário persistente entre sessões.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL · Claude API | **Nivel:** 3 — Avancado

---

## Descricao

Um assistente pessoal que aprende sobre o usuário ao longo do tempo. Após cada conversa, o sistema extrai fatos importantes e os armazena no PostgreSQL. Na próxima sessão, o assistente carrega as memórias relevantes e as usa para personalizar respostas. Implementa memória externa para LLMs sem janela de contexto infinita. Frontend em Next.js com interface de chat e painel de gerenciamento de memórias.

---

## Regras de Negocio

- Fatos factuais (nome, profissão, localização) são sempre carregados no contexto.
- Fatos contextuais (projetos, compromissos) são carregados por relevância semântica.
- Memórias têm data de criação, data de última menção e score de relevância.
- Memórias não mencionadas em 30 dias são arquivadas (não deletadas).
- O usuário pode consultar, corrigir e deletar suas próprias memórias.
- Múltiplos usuários são suportados (autenticados por sessão no frontend).

---

## Requisitos Funcionais

- [ ] RF01 — `POST /sessoes` — cria nova sessão de chat para um usuário
- [ ] RF02 — `POST /sessoes/:id/mensagem` — envia mensagem e recebe resposta com memórias
- [ ] RF03 — `GET /sessoes/:id/stream` — SSE com resposta em streaming
- [ ] RF04 — `POST /sessoes/:id/finalizar` — extrai e salva memórias da sessão encerrada
- [ ] RF05 — `GET /memorias` — lista todas as memórias do usuário autenticado
- [ ] RF06 — `PATCH /memorias/:id` — corrige o conteúdo de uma memória
- [ ] RF07 — `DELETE /memorias/:id` — deleta memória específica
- [ ] RF08 — Frontend Next.js: interface de chat + painel lateral de memórias

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true` (monorepo: `apps/api` + `apps/web`)
- [ ] RNF02 — PostgreSQL com `pgvector` para busca semântica de memórias
- [ ] RNF03 — ORM: Prisma com migrations
- [ ] RNF04 — Extração de memórias via chamada separada à IA (não misturar com conversa)
- [ ] RNF05 — Contexto enviado à IA não deve exceder 20.000 tokens
- [ ] RNF06 — Latência adicional da busca de memórias < 500ms
- [ ] RNF07 — Autenticação simples por `userId` no header (sem OAuth para simplificar)

---

## Estrutura de Arquivos

```text
assistente-memoria/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── memoria/
│   │   │   │   ├── extrator.ts       # Extrai memórias de uma conversa
│   │   │   │   ├── buscador.ts       # Busca semântica por relevância
│   │   │   │   └── repositorio.ts    # CRUD no PostgreSQL
│   │   │   ├── chat/
│   │   │   │   ├── sessao.ts         # Gerenciamento de sessão
│   │   │   │   └── contexto.ts       # Monta contexto com memórias
│   │   │   ├── db/
│   │   │   │   ├── schema.prisma     # Prisma schema
│   │   │   │   └── migrations/
│   │   │   ├── prompts/
│   │   │   │   ├── assistente.txt
│   │   │   │   └── extrator.txt
│   │   │   └── types.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/
│       ├── app/
│       │   ├── page.tsx
│       │   └── components/
│       │       ├── ChatInterface.tsx
│       │       └── MemoryPanel.tsx
│       ├── tsconfig.json
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Schema do Banco de Dados

```sql
CREATE TABLE memorias (
  id           SERIAL PRIMARY KEY,
  usuario_id   TEXT NOT NULL,
  tipo         TEXT NOT NULL,        -- 'fatual' | 'contextual'
  categoria    TEXT,                 -- 'profissao', 'projeto', 'preferencia'
  conteudo     TEXT NOT NULL,
  embedding    vector(1536),
  criado_em    TIMESTAMPTZ DEFAULT now(),
  mencionado_em TIMESTAMPTZ,
  arquivado    BOOLEAN DEFAULT false
);
```

---

## Tarefas

### Setup

- [ ] Criar monorepo com `npm workspaces`
- [ ] API — instalar: `fastify @anthropic-ai/sdk openai @prisma/client dotenv`
- [ ] Web — criar com `create-next-app` + TailwindCSS
- [ ] Criar `docker-compose.yml` com `pgvector/pgvector:pg16`

### Banco de Dados

- [ ] Criar schema `memorias` e `sessoes` no `schema.prisma` e rodar `prisma migrate dev`
- [ ] Migration com índice HNSW no campo `embedding`
- [ ] Funções tipadas de CRUD em `repositorio.ts`

### Memoria

- [ ] Escrever `extrator.txt`: instrução para extrair fatos em JSON com campos fixos
- [ ] Implementar `extrator.ts` com `extrair(conversa: Mensagem[]): Promise<Memoria[]>`
- [ ] Implementar deduplicação: checar similaridade antes de salvar nova memória
- [ ] Implementar `buscador.ts` com `buscarRelevantes(query, userId, topK=10): Promise<Memoria[]>`
- [ ] Separar fatos fatuais (sempre carregados) de contextuais (por relevância)

### Chat

- [ ] Escrever `assistente.txt` com instrução de usar memórias naturalmente
- [ ] Implementar `contexto.ts` que monta bloco de memórias para o system prompt
- [ ] Implementar sessão com acúmulo de histórico e streaming
- [ ] Chamar `extrator` automaticamente ao finalizar sessão

### Frontend (Next.js)

- [ ] `ChatInterface.tsx`: input, histórico, streaming da resposta
- [ ] `MemoryPanel.tsx`: lista de memórias com tipo, categoria e botões editar/deletar
- [ ] Indicador visual quando memórias são usadas na resposta

### Validacao

- [ ] Sessão 1: informar nome, profissão e projeto atual — encerrar
- [ ] Sessão 2: verificar que o assistente lembra os fatos sem repeti-los
- [ ] Editar memória via painel e verificar na sessão seguinte
- [ ] Testar dois usuários diferentes e verificar isolamento completo

---

## Como executar

```bash
docker compose up -d
npm install

npm run dev -w apps/api  # http://localhost:3001
npm run dev -w apps/web  # http://localhost:3000
```
