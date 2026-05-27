# 04 — Onboarding Multi-tenant

RAG com isolamento completo de dados por empresa (multi-tenant) e grafo com contexto de usuário.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** Multi-tenant RAG com Row-Level Security no PostgreSQL
**Topico LangGraph:** Estado com contexto de usuário propagado por todos os nós

---

## Descricao

Plataforma de onboarding onde cada empresa cadastra seus documentos internos (políticas, processos, organogrmas) e seus funcionários podem fazer perguntas. O isolamento de dados garante que funcionários de uma empresa não vejam documentos de outra. Implementa Row-Level Security (RLS) do PostgreSQL para isolamento no nível do banco — a query de busca automaticamente filtra pelo `empresa_id` sem depender da lógica da aplicação.

---

## Regras de Negocio

- Cada empresa tem seu próprio conjunto de documentos isolado.
- Um funcionário só acessa documentos da empresa à qual pertence.
- O isolamento deve ser garantido no banco (RLS), não apenas na aplicação.
- Administradores da empresa podem fazer upload, listar e remover documentos.
- Funcionários só podem fazer perguntas.
- O grafo carrega o perfil do usuário (cargo, departamento) para personalizar a resposta.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /empresas` — cadastro de empresa
- [ ] RF02 — `POST /empresas/:id/usuarios` — cadastro de usuário com papel (admin/funcionario)
- [ ] RF03 — `POST /documentos` — upload restrito a admins, associado à empresa
- [ ] RF04 — `POST /perguntar` — responde pergunta filtrando por empresa do usuário
- [ ] RF05 — Frontend: área admin (upload/gestão) e área funcionário (chat)

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Row-Level Security no PostgreSQL para a tabela `chunks`
- [ ] RNF02 — JWT simples para autenticação (sem OAuth)
- [ ] RNF03 — Estado do grafo inclui `{ usuarioId, empresaId, cargo, departamento }`
- [ ] RNF04 — Nenhuma query de busca pode omitir o filtro `empresa_id`

---

## Grafo LangGraph

```text
[START]
  ↓
[carregarContextoUsuario]   → busca perfil do usuário no banco
  ↓
[buscarDocumentos]          → busca vetorial com filtro empresa_id (via RLS)
  ↓
[personalizarResposta]      → adapta tom e detalhamento ao cargo do usuário
  ↓
[END]
```

---

## Tarefas

### Banco

- [ ] Tabela `empresas`, `usuarios`, `documentos`, `chunks` com coluna `empresa_id`
- [ ] Habilitar RLS: `ALTER TABLE chunks ENABLE ROW LEVEL SECURITY`
- [ ] Policy: `CREATE POLICY empresa_isolation ON chunks USING (empresa_id = current_setting('app.empresa_id')::uuid)`
- [ ] Função que seta `app.empresa_id` antes de cada query

### Auth

- [ ] JWT gerado no login com `{ userId, empresaId, papel }`
- [ ] Middleware Fastify que extrai e valida o JWT
- [ ] Guard que restringe rotas de upload ao papel `admin`

### Grafo

- [ ] Estado tipado com perfil do usuário
- [ ] Nó `carregarContextoUsuario` busca cargo e departamento
- [ ] Nó `personalizarResposta` adapta o prompt ao nível técnico do cargo

### Validacao

- [ ] Criar 2 empresas com documentos diferentes
- [ ] Verificar que perguntas da empresa A nunca retornam chunks da empresa B
- [ ] Verificar que o RLS bloqueia mesmo uma query SQL manual sem o `SET app.empresa_id`

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
