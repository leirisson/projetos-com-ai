# Projetos RAG + LangGraph

Projetos focados em sistemas de Retrieval-Augmented Generation (RAG) orquestrados com LangGraph.

**Stack base:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API

---

## O que e RAG

RAG (Retrieval-Augmented Generation) é a técnica de fornecer à LLM apenas os trechos de documentos
mais relevantes para responder a uma pergunta, em vez de colocar tudo no contexto. O pipeline básico é:

```text
Pergunta do usuário
    ↓
Gerar embedding da pergunta
    ↓
Buscar chunks mais similares no banco vetorial
    ↓
Montar prompt: [system] + [chunks recuperados] + [pergunta]
    ↓
LLM gera resposta fundamentada nos chunks
    ↓
Resposta com citações das fontes
```

## O que e LangGraph

LangGraph é um framework para construir fluxos agênticos como grafos de estado. Cada nó é uma função
TypeScript, as arestas definem transições condicionais, e o estado é tipado. Usado aqui para orquestrar
pipelines RAG complexos (ex: decidir se busca mais documentos, reranking, etc.).

```text
Estado tipado → Nó A → condicional → Nó B ou Nó C → Nó D → Fim
```

---

## Topicos Cobertos por Projeto

| # | Projeto | Topico RAG | Topico LangGraph |
|---|---------|-----------|-----------------|
| 1 | [Documentacao Tecnica](./01-documentacao-tecnica/) | Chunking + busca híbrida | Grafo linear simples |
| 2 | [Chatbot Juridico](./02-chatbot-juridico/) | Reranking com cross-encoder | Nó de reranking condicional |
| 3 | [Relatorios Financeiros](./03-relatorios-financeiros/) | Table-aware chunking | Roteador por tipo de pergunta |
| 4 | [Onboarding Multi-tenant](./04-onboarding-multitenant/) | Isolamento de dados por empresa | Estado com contexto de usuário |
| 5 | [Suporte com Feedback](./05-suporte-feedback/) | Feedback loop no reranker | Ciclo de refinamento |
| 6 | [Pesquisa Cientifica](./06-pesquisa-cientifica/) | Graph RAG (conexões entre docs) | Grafo com ciclos |
| 7 | [Assistente de Codigo](./07-assistente-codigo/) | AST-aware chunking | Agente com tool use |
| 8 | [Compliance Regulatorio](./08-compliance/) | RAG incremental | Pipeline de ingestão agendada |
| 9 | [Catalogo E-commerce](./09-catalogo-ecommerce/) | RAG + filtros de metadata | Roteador semântico |
| 10 | [Tutor de Estudos](./10-tutor-estudos/) | Agentic RAG | Agente que decide quando buscar |

---

## Conceitos Fundamentais

### Chunking
Estratégia de divisão dos documentos em pedaços menores para indexação.

- **Fixed-size**: divide por número fixo de tokens (simples, funciona para texto corrido)
- **Overlap**: chunks se sobrepõem para não perder contexto nas bordas
- **Semantic**: divide por parágrafos ou seções (melhor qualidade, mais complexo)
- **Table-aware**: trata tabelas como unidade indivisível (necessário para dados estruturados)
- **AST-aware**: divide código por funções/classes, não por linhas (necessário para repos)

### Embeddings
Representação vetorial do texto que captura significado semântico.

- Modelo usado: OpenAI `text-embedding-3-small` (1536 dimensões, custo baixo)
- Banco: PostgreSQL + `pgvector` com índice HNSW para busca aproximada rápida
- Métrica: similaridade coseno (`<=>` no pgvector)

### Reranking
Segunda etapa de ordenação dos resultados após a busca vetorial.

- Busca vetorial recupera top-20 candidatos (alta recall)
- Cross-encoder reordena os 20 por relevância real (alta precision)
- Resultado final: top-5 mais relevantes para o contexto

### Busca Hibrida
Combina busca semântica (embeddings) com busca por palavras-chave (BM25/full-text).

- Útil quando o usuário usa termos técnicos exatos (ex: nomes de funções, códigos)
- PostgreSQL suporta ambos nativamente: `pg_trgm` para full-text + `pgvector` para semântica
- Fusão dos resultados via Reciprocal Rank Fusion (RRF)

### Graph RAG
Modela conexões entre documentos como grafo para navegação relacional.

- Chunks conectados por: citações, entidades compartilhadas, hierarquia
- Permite responder perguntas que exigem cruzar múltiplos documentos
- Implementação: Neo4j ou PostgreSQL com tabela de adjacência

### Agentic RAG
O agente decide dinamicamente se precisa buscar mais documentos antes de responder.

- Implementado com LangGraph: nó de decisão verifica se contexto é suficiente
- Se insuficiente: busca mais, reformula a query ou expande o top-k
- Evita respostas com "não encontrei informação" quando o problema é a query

---

## Como os Projetos se Relacionam

```text
Projeto 1 (base)          ← comece aqui: pipeline RAG mais simples
    ↓
Projeto 2 (reranking)     ← adiciona precisão com cross-encoder
    ↓
Projeto 5 (feedback)      ← fecha o ciclo com aprendizado contínuo
    ↓
Projeto 6 (graph)         ← expande para relações entre documentos
    ↓
Projeto 10 (agentic)      ← combina tudo em um agente autônomo
```

---

## Projetos Disponiveis

Cada pasta de projeto contém README completo com descrição, regras de negócio, requisitos
funcionais/não funcionais e tarefas detalhadas para implementação.
