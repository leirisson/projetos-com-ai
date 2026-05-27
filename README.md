# projetos-com-ai

Repositório de projetos práticos com integração de Inteligência Artificial. Cada projeto é estruturado com descrição, regras de negócio, requisitos funcionais e não funcionais, e tarefas de implementação.

**Stack base:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL · OpenRouter SDK

---

## Nivel 1 — Iniciante

| Projeto | Descricao |
| ------- | --------- |
| [Chatbot de FAQ](./nivel-1/chatbot-faq/) | Chatbot que responde perguntas frequentes usando a API via OpenRouter |
| [Classificador de Sentimentos](./nivel-1/classificador-sentimentos/) | Analisa textos e classifica o sentimento como positivo, negativo ou neutro |
| [Gerador de Resumos](./nivel-1/gerador-resumos/) | Recebe um texto longo e gera um resumo conciso com streaming |

---

## Nivel 2 — Intermediario

| Projeto | Descricao |
| ------- | --------- |
| [Assistente de Código](./nivel-2/assistente-codigo/) | CLI que revisa, explica e sugere melhorias em trechos de código |
| [Pipeline de Conteúdo](./nivel-2/pipeline-conteudo/) | Gera, revisa e formata artigos de blog em etapas encadeadas com Fastify |
| [Extrator de Dados de PDFs](./nivel-2/extrator-pdf/) | Lê PDFs e extrai informações estruturadas via tool use com Fastify |

---

## Nivel 3 — Avancado

| Projeto | Descricao |
| ------- | --------- |
| [Agente de Pesquisa Autônomo](./nivel-3/agente-pesquisa/) | Agente que pesquisa na web de forma autônoma com Fastify + Next.js |
| [Sistema RAG de Documentos](./nivel-3/sistema-rag/) | Pipeline RAG com pgvector, Fastify e interface Next.js |
| [Assistente com Memória Persistente](./nivel-3/assistente-memoria/) | Assistente com memória de longo prazo no PostgreSQL |

---

## RAG + LangGraph

10 sistemas RAG progressivos orquestrados com LangGraph.js, do pipeline simples ao agentic RAG.

| Projeto | Topico RAG | Topico LangGraph |
| ------- | ---------- | ---------------- |
| [01 — Documentação Técnica](./rag-langgraph/01-documentacao-tecnica/) | Busca híbrida | Grafo linear |
| [02 — Chatbot Jurídico](./rag-langgraph/02-chatbot-juridico/) | Reranking | Nó condicional |
| [03 — Relatórios Financeiros](./rag-langgraph/03-relatorios-financeiros/) | Table-aware chunking | Roteador semântico |
| [04 — Onboarding Multi-tenant](./rag-langgraph/04-onboarding-multitenant/) | Row-Level Security | Estado com contexto |
| [05 — Suporte com Feedback](./rag-langgraph/05-suporte-feedback/) | Feedback loop | Ciclo de refinamento |
| [06 — Pesquisa Científica](./rag-langgraph/06-pesquisa-cientifica/) | Graph RAG | Grafo com ciclos |
| [07 — Assistente de Código](./rag-langgraph/07-assistente-codigo/) | AST chunking | Agente com tool use |
| [08 — Compliance Regulatório](./rag-langgraph/08-compliance-regulatorio/) | RAG incremental | Pipeline de ingestão |
| [09 — Catálogo E-commerce](./rag-langgraph/09-catalogo-ecommerce/) | Filtros de metadata | Roteador + extração |
| [10 — Tutor de Estudos](./rag-langgraph/10-tutor-estudos/) | Agentic RAG | Checkpointing + ciclos |

---

## LangGraph — Conceitos Isolados

10 projetos focados exclusivamente nos padrões do LangGraph.js, sem RAG.

| Projeto | Conceito |
| ------- | -------- |
| [01 — Grafo Linear](./langgraph/01-grafo-linear/) | StateGraph, Annotation, invoke |
| [02 — Arestas Condicionais](./langgraph/02-arestas-condicionais/) | addConditionalEdges, roteamento |
| [03 — Ciclos e Loops](./langgraph/03-ciclos-loops/) | Grafos cíclicos, contador de iterações |
| [04 — Checkpointing](./langgraph/04-checkpointing/) | Persistência, retomada de sessão |
| [05 — Streaming](./langgraph/05-streaming/) | streamEvents, SSE, Next.js |
| [06 — Subgrafos](./langgraph/06-subgrafos/) | Composição de grafos, mapeamento de estado |
| [07 — Human in the Loop](./langgraph/07-human-in-the-loop/) | interrupt(), aprovação humana |
| [08 — Execução Paralela](./langgraph/08-paralelo/) | Fan-out, fan-in, Send API |
| [09 — Agente com Tool Use](./langgraph/09-agente-tool-use/) | ToolNode, createReactAgent |
| [10 — Multi-Agente](./langgraph/10-multi-agente/) | Supervisor pattern, handoff |

---

## Como usar este repositório

1. Escolha uma trilha: **Iniciante → Intermediario → Avancado** ou vá direto para **RAG** ou **LangGraph**
2. Leia o `README.md` dentro da pasta do projeto
3. Siga as tarefas listadas para implementar a solução
4. Use os requisitos como critério de aceite

## Stack Tecnologica

- **LLMs:** OpenRouter SDK (acesso a Claude, GPT-4, Gemini e outros via uma única API)
- **Backend:** Fastify + TypeScript
- **Frontend:** Next.js + TailwindCSS
- **Banco de Dados:** PostgreSQL + pgvector
- **ORM:** drizzle-orm
- **Agentes:** LangGraph.js
- **Embeddings:** OpenAI text-embedding-3-small
