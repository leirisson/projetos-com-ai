# 09 — Catalogo E-commerce com RAG e Filtros

RAG com filtros de metadata estruturado combinados com busca semântica.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** RAG com filtros de metadata (preço, categoria, estoque) + busca semântica
**Topico LangGraph:** Roteador semântico + nó de extração de filtros da pergunta natural

---

## Descricao

Assistente de e-commerce que responde perguntas sobre produtos em linguagem natural, combinando busca semântica com filtros estruturados. A pergunta "tênis de corrida até R$300 disponível em tamanho 42" é decomposta pelo agente em: query semântica ("tênis de corrida") + filtros (`preco <= 300`, `tamanho = 42`, `estoque > 0`). O grafo extrai os filtros antes de buscar.

---

## Regras de Negocio

- Cada produto é um chunk com metadata: preço, categoria, marca, tamanhos, estoque.
- O grafo extrai filtros estruturados da pergunta antes de fazer a busca.
- Busca combina similaridade semântica com filtros SQL (`WHERE`).
- Produtos fora de estoque só aparecem se o usuário perguntar explicitamente.
- Respostas de comparação devem listar produtos em tabela markdown.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /produtos` — cadastro ou importação de catálogo (JSON bulk)
- [ ] RF02 — `POST /perguntar` — chat sobre produtos com extração de filtros
- [ ] RF03 — `GET /produtos/buscar?q=` — busca direta no catálogo (sem IA)
- [ ] RF04 — Resposta inclui lista de produtos com preço, disponibilidade e link
- [ ] RF05 — Frontend: interface de chat + cards de produto na resposta

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Metadata dos produtos como colunas no PostgreSQL, não como JSON
- [ ] RNF02 — Busca: `WHERE categoria = $1 AND preco <= $2 AND estoque > 0 ORDER BY embedding <=> $query`
- [ ] RNF03 — Extração de filtros via Claude com structured output (JSON tipado)
- [ ] RNF04 — Cache de embeddings de produtos: só regenera ao atualizar o produto

---

## Grafo LangGraph

```text
[START]
  ↓
[extrairFiltros]        → Claude extrai: categoria, precoMax, tamanho, marcas, emEstoque
  ↓
[buscarComFiltros]      → query vetorial + WHERE com filtros extraídos
  ↓
[avaliarResultados]     → 0 resultados?
  ↓ sim                 ↓ não
[relaxarFiltros]    [gerarResposta]   → formata em cards/tabela
  ↓                       ↓
[buscarComFiltros]      [END]
```

---

## Tarefas

### Banco

- [ ] Tabela `produtos` com: `nome`, `descricao`, `preco`, `categoria`, `marca`, `tamanhos TEXT[]`, `estoque`, `embedding vector(1536)`
- [ ] Índice HNSW no embedding
- [ ] Índices B-tree em `preco`, `categoria`, `estoque`

### Extração de Filtros

- [ ] Prompt para Claude retornar JSON: `{ querySemantica, categoria, precoMax, tamanho, emEstoque }`
- [ ] Interface TypeScript para o resultado
- [ ] Nó `relaxarFiltros`: remove o filtro mais restritivo quando há 0 resultados

### Frontend

- [ ] Chat com cards de produto inline na resposta (imagem, nome, preço, botão)
- [ ] Indicar filtros detectados acima do resultado ("Filtrando por: tênis, até R$300")

### Validacao

- [ ] "tênis de corrida feminino até R$200" → verificar filtros extraídos
- [ ] Pergunta que retorna 0 resultados → verificar relaxamento automático
- [ ] "compare os 3 tênis mais baratos" → verificar tabela na resposta

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
