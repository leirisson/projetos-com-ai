# 03 — Analisador de Relatorios Financeiros

RAG com table-aware chunking e roteador semântico por tipo de pergunta.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** Table-aware chunking — tabelas tratadas como unidade indivisível
**Topico LangGraph:** Roteador semântico — pergunta numérica vs. pergunta narrativa

---

## Descricao

Análise de relatórios financeiros em PDF (balanços, DREs, fluxo de caixa). O desafio principal é que dados financeiros vivem em tabelas — o chunking por tokens corta tabelas ao meio e torna os dados inutilizáveis. O sistema detecta tabelas no PDF, as extrai como unidade única e armazena com metadata estruturado. O grafo LangGraph roteia a pergunta para o nó correto: numérico (recupera tabelas) ou narrativo (recupera texto).

---

## Regras de Negocio

- Tabelas são extraídas inteiras e nunca divididas em chunks.
- Texto corrido é dividido por parágrafo com overlap de 1 parágrafo.
- O roteador classifica cada pergunta como `numerica` ou `narrativa` antes da busca.
- Perguntas numéricas buscam apenas em chunks do tipo `tabela`.
- Perguntas narrativas buscam apenas em chunks do tipo `texto`.
- Respostas com números devem citar a tabela de origem e o período.

---

## Requisitos Funcionais

- [ ] RF01 — Upload de relatórios PDF com extração separada de texto e tabelas
- [ ] RF02 — `POST /perguntar` com roteamento automático por tipo de pergunta
- [ ] RF03 — Resposta com citação de fonte (tabela ou seção de texto)
- [ ] RF04 — `GET /documentos/:id/tabelas` — lista tabelas extraídas de um documento
- [ ] RF05 — Frontend: upload, visualizador de tabelas extraídas e chat

---

## Requisitos Nao Funcionais

- [ ] RNF01 — `pdf-parse` + `tabula-js` para extração de tabelas de PDFs
- [ ] RNF02 — Tabelas armazenadas como JSON estruturado + embedding do conteúdo textualizado
- [ ] RNF03 — Campo `tipo` nos chunks: `"tabela"` ou `"texto"` para filtro na busca
- [ ] RNF04 — Roteador LangGraph via chamada rápida ao Claude (sem streaming)

---

## Grafo LangGraph

```text
[START]
  ↓
[rotearPergunta]        → classifica: "numerica" | "narrativa"
  ↓ numerica            ↓ narrativa
[buscarTabelas]    [buscarTextos]
  ↓                     ↓
      [gerarResposta]
           ↓
         [END]
```

---

## Tarefas

### Setup

- [ ] Monorepo + Docker com pgvector
- [ ] Instalar: `tabula-js` (wrapper do Tabula para extração de tabelas)

### Chunking

- [ ] Implementar `tableExtractor.ts` com `extrairTabelas(pdfPath): Tabela[]`
- [ ] Serializar cada tabela para texto (ex: CSV) antes de gerar embedding
- [ ] Armazenar JSON original da tabela no campo `metadata` do chunk

### Grafo

- [ ] Nó `rotearPergunta`: prompt rápido ao Claude, retorna `"numerica"` ou `"narrativa"`
- [ ] Nó `buscarTabelas`: filtra chunks com `WHERE tipo = 'tabela'` + busca vetorial
- [ ] Nó `buscarTextos`: filtra chunks com `WHERE tipo = 'texto'` + busca vetorial
- [ ] Nó `gerarResposta`: instrução específica para citar período e nome da tabela

### Validacao

- [ ] Carregar balanço patrimonial e testar "Qual o ativo total em 2023?" (rota numérica)
- [ ] Testar "Quais os principais riscos mencionados?" (rota narrativa)
- [ ] Verificar que perguntas numéricas não retornam chunks de texto e vice-versa

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
