# Pipeline de Conteudo

Gera, revisa e formata artigos de blog com múltiplas chamadas encadeadas à IA.

**Stack:** Node.js · TypeScript · Fastify · Claude API | **Nivel:** 2 — Intermediario

---

## Descricao

O usuário fornece um tema via API REST (Fastify) e o pipeline executa três etapas encadeadas: gera um rascunho, passa o rascunho por uma revisão crítica (segunda chamada à IA), e por fim formata o texto em Markdown pronto para publicação. Introduz multi-step prompting, orquestração de chamadas de IA e API REST com Fastify + TypeScript.

---

## Regras de Negocio

- O pipeline tem 3 etapas obrigatórias em sequência: `gerar → revisar → formatar`.
- Cada etapa usa um system prompt distinto com "papel" diferente para a IA.
- Se a revisão identificar problemas críticos, o pipeline volta para geração (máx 1 reprocessamento).
- O artigo final deve ter entre 600 e 1500 palavras.
- Todos os artefatos intermediários devem ser salvos para auditoria.
- O usuário pode escolher o tom: `formal`, `casual` ou `tecnico`.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /pipeline` com body `{ tema: string, tom: "formal" | "casual" | "tecnico" }`
- [ ] RF02 — `GET /pipeline/:id` para consultar status e resultado de um pipeline em andamento
- [ ] RF03 — Etapa 1 (Gerar): rascunho com título, introdução, 3-5 seções e conclusão
- [ ] RF04 — Etapa 2 (Revisar): retorna JSON com `aprovado: boolean`, `problemas: string[]`, `sugestoes: string[]`
- [ ] RF05 — Etapa 3 (Formatar): Markdown com frontmatter YAML
- [ ] RF06 — Se revisão reprovar, reprocessar etapa 1 com os problemas como contexto
- [ ] RF07 — Salvar artefatos em `saida/<id>/`: `rascunho.md`, `revisao.json`, `artigo-final.md`
- [ ] RF08 — SSE em `GET /pipeline/:id/stream` para acompanhar progresso em tempo real

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — Fastify com `fastify-type-provider-zod` para validação de schema
- [ ] RNF03 — Cada etapa em arquivo separado dentro de `src/etapas/`
- [ ] RNF04 — Tempo total do pipeline não deve exceder 3 minutos
- [ ] RNF05 — Logs devem incluir tempo e contagem de tokens por etapa

---

## Estrutura de Arquivos

```text
pipeline-conteudo/
├── src/
│   ├── server.ts              # Servidor Fastify e rotas
│   ├── pipeline.ts            # Orquestrador principal
│   ├── etapas/
│   │   ├── gerador.ts         # Etapa 1: geração do rascunho
│   │   ├── revisor.ts         # Etapa 2: revisão crítica
│   │   └── formatador.ts      # Etapa 3: formatação final
│   ├── prompts/
│   │   ├── gerador.txt
│   │   ├── revisor.txt
│   │   └── formatador.txt
│   └── types.ts               # Interfaces: PipelineJob, Rascunho, Revisao, ArtigoFinal
├── saida/                     # Criado em runtime (gitignored)
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i fastify @fastify/type-provider-zod zod @anthropic-ai/sdk dotenv slugify`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`

### Prompts

- [ ] Escrever `gerador.txt`: jornalista experiente, estrutura e comprimento esperado
- [ ] Escrever `revisor.txt`: editor crítico, instrução de retornar JSON com campos fixos
- [ ] Escrever `formatador.txt`: especialista em Markdown, frontmatter YAML obrigatório

### Etapas

- [ ] Implementar `gerador.ts` com `executar(tema: string, tom: Tom, feedback?: string): Promise<Rascunho>`
- [ ] Implementar `revisor.ts` com `executar(rascunho: Rascunho): Promise<Revisao>` e parse do JSON
- [ ] Implementar `formatador.ts` com `executar(rascunho: Rascunho): Promise<ArtigoFinal>`

### API

- [ ] Implementar rotas em `server.ts` com schemas Zod
- [ ] Implementar `pipeline.ts` com `executar(job: PipelineJob)` e lógica de reprocessamento
- [ ] Implementar salvamento dos artefatos em `saida/<id>/`
- [ ] Implementar SSE para progresso em tempo real

### Validacao

- [ ] `POST /pipeline` com tema "IA na medicina", tom formal
- [ ] Verificar que os 3 arquivos são criados em `saida/`
- [ ] Forçar reprovação na revisão e verificar reprocessamento
- [ ] Contar palavras do artigo final (600–1500)

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# POST http://localhost:3000/pipeline
```
