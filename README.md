# projetos-com-ai

Repositório de projetos práticos com integração de Inteligência Artificial.

**Stack base:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL · Prisma · OpenRouter SDK

---

## Trilha de Implementacao

Siga esta ordem. Cada etapa constrói sobre a anterior.

```text
01  nivel-1          → API básica, prompt, streaming, structured output
02  nivel-2          → Fastify com multipart, pipelines multi-step, tool use simples
03  function-calling → Tool use aprofundado: loop, múltiplas ferramentas, side effects
04  nivel-3          → RAG básico, agente autônomo, memória persistente
05  langgraph        → Conceitos isolados do LangGraph: estado, ciclos, checkpointing
06  rag-langgraph    → RAG + LangGraph aplicados: reranking, graph RAG, agentic RAG
```

---

## 01 — Nivel 1 · Iniciante

Primeiro contato com a API via OpenRouter, streaming e structured output.

| Projeto | O que aprende |
| ------- | ------------- |
| [Chatbot de FAQ](./nivel-1/chatbot-faq/) | Fastify básico, SSE, multi-turn stateless |
| [Classificador de Sentimentos](./nivel-1/classificador-sentimentos/) | Structured output, retry, processamento em lote |
| [Gerador de Resumos](./nivel-1/gerador-resumos/) | Prompt engineering com parâmetros, streaming progressivo |

---

## 02 — Nivel 2 · Intermediario

Fastify com recursos mais completos: multipart, pipelines encadeados, tool use.

| Projeto | O que aprende |
| ------- | ------------- |
| [Assistente de Código](./nivel-2/assistente-codigo/) | Upload de arquivo com multipart, histórico em disco |
| [Pipeline de Conteúdo](./nivel-2/pipeline-conteudo/) | Multi-step prompting, orquestração de chamadas sequenciais |
| [Extrator de PDFs](./nivel-2/extrator-pdf/) | Tool use para structured output, visão, processamento de PDF |

---

## 03 — Function Calling

Tool use aprofundado: do loop básico ao encadeamento de APIs reais.

| Projeto | O que aprende |
| ------- | ------------- |
| [Calculadora Conversacional](./function-calling/01-calculadora/) | Loop completo: detectar `tool_calls`, executar, reenviar |
| [Assistente de Dados](./function-calling/02-assistente-dados/) | Múltiplas ferramentas em sequência, LLM escolhe a ordem |
| [Agente de Calendário](./function-calling/03-calendario/) | Side effects, confirmação humana antes de executar |
| [Extrator Estruturado](./function-calling/04-extrator-estruturado/) | Forced tool use (`tool_choice: "required"`) para structured output garantido |
| [Orquestrador de APIs](./function-calling/05-orquestrador-apis/) | Ferramentas chamando APIs HTTP reais, cache, latência |

---

## 04 — Nivel 3 · Avancado

RAG básico sem frameworks, agentes autônomos e memória persistente com Prisma + PostgreSQL.

| Projeto | O que aprende |
| ------- | ------------- |
| [Agente de Pesquisa Autônomo](./nivel-3/agente-pesquisa/) | Agentic loop manual, tool use com busca na web, SSE |
| [Sistema RAG de Documentos](./nivel-3/sistema-rag/) | Pipeline RAG do zero: chunking, embeddings, pgvector, geração |
| [Assistente com Memória Persistente](./nivel-3/assistente-memoria/) | Memória externa com embeddings, Prisma, perfil de usuário |

---

## 05 — LangGraph · Conceitos Isolados

Aprenda cada padrão do LangGraph separadamente antes de aplicar em sistemas reais.

| Projeto | Conceito |
| ------- | -------- |
| [01 — Grafo Linear](./langgraph/01-grafo-linear/) | StateGraph, Annotation, nós, arestas, invoke |
| [02 — Arestas Condicionais](./langgraph/02-arestas-condicionais/) | `addConditionalEdges`, função de roteamento |
| [03 — Ciclos e Loops](./langgraph/03-ciclos-loops/) | Grafos cíclicos, contador de iterações, saída condicional |
| [04 — Checkpointing](./langgraph/04-checkpointing/) | `PostgresSaver`, `thread_id`, retomada entre requisições |
| [05 — Streaming](./langgraph/05-streaming/) | `streamEvents`, SSE por nó, consumo no Next.js |
| [06 — Subgrafos](./langgraph/06-subgrafos/) | Composição de grafos, mapeamento de estado pai ↔ filho |
| [07 — Human in the Loop](./langgraph/07-human-in-the-loop/) | `interrupt()`, aprovação humana, retomada após confirmação |
| [08 — Execução Paralela](./langgraph/08-paralelo/) | Fan-out, fan-in, `Send` API para N ramos dinâmicos |
| [09 — Agente com Tool Use](./langgraph/09-agente-tool-use/) | `ToolNode`, `createReactAgent`, loop agêntico |
| [10 — Multi-Agente](./langgraph/10-multi-agente/) | Supervisor pattern, handoff entre agentes especializados |

---

## 06 — RAG + LangGraph · Aplicado

Sistemas RAG progressivos orquestrados com LangGraph. Cada projeto acrescenta uma técnica RAG nova.

| Projeto | Tecnica RAG | Padrao LangGraph |
| ------- | ----------- | ---------------- |
| [01 — Documentação Técnica](./rag-langgraph/01-documentacao-tecnica/) | Busca híbrida (semântica + full-text) | Grafo linear |
| [02 — Chatbot Jurídico](./rag-langgraph/02-chatbot-juridico/) | Reranking com cross-encoder | Nó condicional por score |
| [03 — Relatórios Financeiros](./rag-langgraph/03-relatorios-financeiros/) | Table-aware chunking | Roteador semântico |
| [04 — Onboarding Multi-tenant](./rag-langgraph/04-onboarding-multitenant/) | Row-Level Security por empresa | Estado com contexto de usuário |
| [05 — Suporte com Feedback](./rag-langgraph/05-suporte-feedback/) | Feedback loop nos scores de chunks | Ciclo de refinamento |
| [06 — Pesquisa Científica](./rag-langgraph/06-pesquisa-cientifica/) | Graph RAG — conexões entre documentos | Grafo com ciclos |
| [07 — Assistente de Código](./rag-langgraph/07-assistente-codigo/) | AST-aware chunking | Agente com tool use |
| [08 — Compliance Regulatório](./rag-langgraph/08-compliance-regulatorio/) | RAG incremental com watcher | Pipeline de ingestão agendada |
| [09 — Catálogo E-commerce](./rag-langgraph/09-catalogo-ecommerce/) | RAG + filtros de metadata estruturado | Extração de filtros + roteador |
| [10 — Tutor de Estudos](./rag-langgraph/10-tutor-estudos/) | Agentic RAG — agente decide quando buscar | Checkpointing + ciclos |

---

## Stack Tecnologica

| Camada | Tecnologia |
| ------ | ---------- |
| LLMs | OpenRouter SDK — acesso a Claude, GPT-4, Gemini via uma API |
| Backend | Fastify + TypeScript (`strict: true`) |
| Frontend | Next.js + TailwindCSS |
| Banco de dados | PostgreSQL + extensão `pgvector` |
| ORM | Prisma |
| Agentes | LangGraph.js |
| Embeddings | OpenAI `text-embedding-3-small` |
