# 06 — Pesquisa Cientifica com Graph RAG

Graph RAG que navega conexões entre artigos científicos para responder perguntas multi-documento.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector + adjacência) · LangGraph.js · Claude API
**Topico RAG:** Graph RAG — chunks conectados por citações e entidades compartilhadas
**Topico LangGraph:** Grafo com ciclos — expande vizinhos até cobertura suficiente

---

## Descricao

Sistema para pesquisadores que precisam cruzar informações de múltiplos artigos. RAG tradicional recupera chunks isolados — mas perguntas como "Como o trabalho de X se relaciona com Y?" exigem navegar conexões. O Graph RAG modela chunks como nós e suas relações (citações, entidades compartilhadas) como arestas. O grafo LangGraph navega os vizinhos dos chunks iniciais até ter cobertura suficiente para responder.

---

## Regras de Negocio

- Cada artigo é dividido em seções (introdução, metodologia, resultados, conclusão).
- Durante a ingestão, a IA extrai entidades (autores, conceitos, métodos) de cada chunk.
- Dois chunks são conectados se: um cita o outro, ou compartilham 2+ entidades.
- A navegação do grafo expande no máximo 2 graus de profundidade.
- Respostas de múltiplos artigos devem indicar de qual artigo cada afirmação vem.

---

## Requisitos Funcionais

- [ ] RF01 — Upload de artigos em PDF com extração de metadados (título, autores, ano)
- [ ] RF02 — Extração automática de entidades durante a ingestão
- [ ] RF03 — `POST /perguntar` — resposta navegando o grafo de conexões
- [ ] RF04 — `GET /grafo` — retorna o grafo de conexões para visualização
- [ ] RF05 — Frontend: upload, visualização do grafo (D3.js) e chat

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Tabela `arestas` com `chunk_id_origem`, `chunk_id_destino`, `tipo` (citacao/entidade)
- [ ] RNF02 — Extração de entidades via Claude (chamada separada, assíncrona)
- [ ] RNF03 — Expansão de vizinhos com query SQL recursiva (CTE recursivo)
- [ ] RNF04 — Máximo de 50 chunks no contexto final (poda por score se ultrapassar)

---

## Grafo LangGraph

```text
[START]
  ↓
[buscarChunksIniciais]      → top-5 por similaridade vetorial
  ↓
[expandirVizinhos]          → CTE recursivo: busca vizinhos a 1-2 graus
  ↓
[avaliarCobertura]          → contexto suficiente para responder?
  ↓ não (máx 2x)            ↓ sim
[refinarQuery]         [podarContexto]   → top-50 por score
     ↓                       ↓
[buscarChunksIniciais]  [gerarResposta]
                             ↓
                           [END]
```

---

## Tarefas

### Banco

- [ ] Tabela `entidades` com `chunk_id`, `nome`, `tipo` (pessoa/conceito/metodo)
- [ ] Tabela `arestas` com `chunk_id_origem`, `chunk_id_destino`, `tipo`, `peso`
- [ ] CTE recursivo para buscar vizinhos a N graus

### Ingestao

- [ ] Extrair seções do PDF (intro/metod/result/conclusao) como chunks distintos
- [ ] Chamada assíncrona ao Claude para extrair entidades de cada chunk
- [ ] Job que roda após ingestão para criar arestas entre chunks com entidades compartilhadas

### Grafo

- [ ] Nó `expandirVizinhos`: executa CTE recursivo com os chunk IDs iniciais
- [ ] Nó `avaliarCobertura`: conta artigos únicos cobertos, decide se expande
- [ ] Nó `podarContexto`: ordena todos os chunks por score, pega top-50

### Frontend

- [ ] Visualização do grafo com D3.js (nós = chunks, arestas = conexões)
- [ ] Destacar no grafo os chunks usados na última resposta

### Validacao

- [ ] Carregar 5 artigos relacionados
- [ ] Perguntar "Qual a diferença entre a abordagem de [artigo A] e [artigo B]?"
- [ ] Verificar que o grafo é expandido e ambos os artigos aparecem na resposta

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
