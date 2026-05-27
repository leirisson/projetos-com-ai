# 07 — Assistente de Codigo com AST Chunking

RAG sobre repositórios de código com chunking por AST (funções e classes como unidade).

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** AST-aware chunking — funções/classes nunca divididas no meio
**Topico LangGraph:** Agente com tool use — busca código, executa e itera

---

## Descricao

O desenvolvedor indexa um repositório inteiro e pode perguntar sobre funções específicas, pedir exemplos de uso ou pedir que o agente explique o fluxo de uma feature. O chunking usa o AST (Abstract Syntax Tree) para dividir o código por unidades semânticas (função, classe, método) — nunca no meio de um bloco. O agente LangGraph pode usar ferramentas para buscar mais código quando a primeira busca não for suficiente.

---

## Regras de Negocio

- Cada função, classe ou método é um chunk independente.
- Comentários JSDoc/docstrings são incluídos no chunk da função correspondente.
- O chunk inclui metadata: arquivo, linha de início, linha de fim, linguagem, nome da função.
- Arquivos em `node_modules/`, `dist/` e `.git/` são ignorados automaticamente.
- O agente pode buscar até 3 vezes antes de gerar a resposta final.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /repositorios` — caminho local do repositório para indexar
- [ ] RF02 — `GET /repositorios/:id/stats` — linguagens, nº de arquivos, nº de funções indexadas
- [ ] RF03 — `POST /perguntar` — agente busca código e responde com trechos citados
- [ ] RF04 — Busca por nome exato de função (full-text) e por semântica (vetorial)
- [ ] RF05 — Frontend: seletor de repositório, chat com syntax highlighting nas citações

---

## Requisitos Nao Funcionais

- [ ] RNF01 — AST parsing: `@typescript-eslint/typescript-estree` para TS/JS, `tree-sitter` para outras linguagens
- [ ] RNF02 — Chunks com metadata: `{ arquivo, linhaInicio, linhaFim, nomeFuncao, linguagem }`
- [ ] RNF03 — Agente LangGraph com tool use: ferramentas `buscarPorNome` e `buscarPorSemantica`
- [ ] RNF04 — Syntax highlighting no frontend com `highlight.js` ou `shiki`

---

## Grafo LangGraph (Agente)

```text
[START]
  ↓
[agente]               → Claude com tool use decide qual ferramenta usar
  ↓ tool_use           ↓ stop
[executarFerramenta]   [gerarResposta]
  ↓                        ↓
[agente]                 [END]
(loop: máx 3x)
```

### Ferramentas disponíveis

```typescript
tools = [
  buscarPorNome(nome: string),        // full-text search no nome da função
  buscarPorSemantica(descricao: string), // embedding search
  buscarArquivo(caminho: string),      // retorna todas as funções de um arquivo
]
```

---

## Tarefas

### Setup

- [ ] Instalar: `@typescript-eslint/typescript-estree` para AST parsing de TS/JS

### AST Chunking

- [ ] Implementar `astChunker.ts` com `extrairFuncoes(arquivo): Chunk[]`
- [ ] Suporte inicial: TypeScript e JavaScript
- [ ] Incluir docstring/JSDoc no texto do chunk
- [ ] Ignorar arquivos por `.gitignore` patterns

### Grafo Agente

- [ ] Definir tool definitions no formato Anthropic SDK
- [ ] Implementar dispatcher de ferramentas
- [ ] Loop: `enquanto stop_reason === "tool_use" && tentativas < 3`
- [ ] Estado com `resultadosBusca`, `tentativas`, `resposta`

### Frontend

- [ ] Seletor de repositório indexado
- [ ] Chat com citações de código em blocos com syntax highlighting
- [ ] Mostrar arquivo + linha de cada citação

### Validacao

- [ ] Indexar o próprio projeto e perguntar "como funciona o chunker?"
- [ ] Perguntar pelo nome exato de uma função — deve retornar via full-text
- [ ] Verificar que o agente usa múltiplas buscas quando necessário

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
