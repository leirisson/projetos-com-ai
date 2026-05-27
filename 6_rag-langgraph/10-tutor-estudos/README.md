# 10 — Tutor de Estudos com Agentic RAG

Agentic RAG — o agente decide autonomamente quando buscar mais material antes de responder.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** Agentic RAG — agente avalia se contexto é suficiente e decide buscar mais
**Topico LangGraph:** Grafo com ciclos, estado persistido e checkpointing para retomar sessões

---

## Descricao

Tutor que usa apostilas e materiais de estudo indexados para responder perguntas, gerar exercícios e explicar conceitos em diferentes profundidades. Diferente do RAG passivo (sempre busca top-k e responde), o agente avalia o contexto recuperado e decide se precisa de mais material antes de responder. Se a pergunta exigir cruzar múltiplos tópicos, o agente faz múltiplas buscas com queries reformuladas. O checkpointing do LangGraph permite retomar uma sessão de estudos onde parou.

---

## Regras de Negocio

- O agente avalia se os chunks recuperados são suficientes para uma boa resposta.
- Se insuficientes, reformula a query e busca novamente (máx 3 buscas adicionais).
- O tutor adapta a profundidade da explicação ao nível declarado pelo aluno (iniciante/intermediario/avancado).
- Exercícios gerados devem ser baseados exclusivamente no material indexado.
- O estado da sessão (histórico + tópicos vistos) é persistido para continuidade.

---

## Requisitos Funcionais

- [ ] RF01 — Upload de apostilas PDF por disciplina/matéria
- [ ] RF02 — `POST /sessoes` — inicia sessão com `{ alunoId, materia, nivel }`
- [ ] RF03 — `POST /sessoes/:id/mensagem` — envia pergunta ao tutor agêntico
- [ ] RF04 — `POST /sessoes/:id/exercicio` — solicita exercício sobre o tópico atual
- [ ] RF05 — `POST /sessoes/:id/verificar` — aluno envia resposta, tutor avalia
- [ ] RF06 — `GET /sessoes/:id/progresso` — tópicos vistos, exercícios feitos, acertos
- [ ] RF07 — Frontend: chat com tutor, painel de progresso e área de exercícios

---

## Requisitos Nao Funcionais

- [ ] RNF01 — LangGraph com checkpointing (estado persistido no PostgreSQL)
- [ ] RNF02 — Grafo com ciclos: nó de avaliação pode retornar ao nó de busca
- [ ] RNF03 — Estado tipado inclui: histórico, topicosVistos, nivel, buscasRealizadas
- [ ] RNF04 — Nó de reformulação de query usa o histórico da conversa como contexto

---

## Grafo LangGraph (Agentico)

```text
[START]
  ↓
[buscarMaterial]            → top-5 chunks por similaridade
  ↓
[avaliarSuficiencia]        → contexto cobre a pergunta? buscas < 3?
  ↓ insuficiente            ↓ suficiente
[reformularQuery]       [gerarResposta]
  ↓                          ↓
[buscarMaterial]         [registrarTopico]   → salva tópico como "visto"
(ciclo, máx 3x)               ↓
                            [END]
```

### Grafo de Exercicio

```text
[START: /exercicio]
  ↓
[buscarMaterialTopico]    → busca chunks do tópico atual
  ↓
[gerarExercicio]          → Claude gera questão baseada nos chunks
  ↓
[aguardarResposta]        → estado persistido (checkpointing)
  ↓ resposta do aluno
[avaliarResposta]         → correto? explicação do erro?
  ↓
[registrarResultado]
  ↓
[END]
```

---

## Estrutura de Arquivos

```text
10-tutor-estudos/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── grafos/
│   │   │   │   ├── tutorGrafo.ts         # Grafo principal de tutoria
│   │   │   │   ├── exercicioGrafo.ts     # Grafo de exercícios
│   │   │   │   ├── state.ts              # TutorState com checkpointing
│   │   │   │   └── nos/
│   │   │   │       ├── buscarMaterial.ts
│   │   │   │       ├── avaliarSuficiencia.ts
│   │   │   │       ├── reformularQuery.ts
│   │   │   │       ├── gerarResposta.ts
│   │   │   │       └── gerarExercicio.ts
│   │   │   ├── checkpointer.ts           # Persistência de estado no PostgreSQL
│   │   │   └── db/schema.ts
│   │   └── package.json
│   └── web/
│       ├── app/
│       │   └── components/
│       │       ├── TutorChat.tsx
│       │       ├── ExercicioPanel.tsx
│       │       └── ProgressoDashboard.tsx
│       └── package.json
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Tarefas

### Setup

- [ ] Monorepo + Docker com pgvector
- [ ] Instalar: `npm i @langchain/langgraph @langchain/langgraph-checkpoint-postgres openai @prisma/client fastify dotenv`

### Checkpointing

- [ ] Implementar `checkpointer.ts` usando `@langchain/langgraph-checkpoint-postgres`
- [ ] Tabela `langgraph_checkpoints` gerenciada pelo LangGraph
- [ ] Verificar que ao retomar uma sessão o histórico é recuperado corretamente

### Grafo Tutor

- [ ] Nó `avaliarSuficiencia`: prompt rápido para Claude avaliar se contexto é suficiente
- [ ] Nó `reformularQuery`: gera nova query baseada na pergunta original + chunks insuficientes
- [ ] Contador de buscas no estado para limitar o ciclo

### Grafo Exercicio

- [ ] Estado separado para fluxo de exercícios
- [ ] Nó `aguardarResposta`: persiste estado e retorna ID para o frontend consultar
- [ ] Nó `avaliarResposta`: Claude compara resposta do aluno com material fonte

### Frontend

- [ ] Chat com indicação visual quando o tutor está buscando mais material
- [ ] Painel de progresso com tópicos vistos e taxa de acerto em exercícios
- [ ] Área de exercício com campo de resposta e feedback detalhado

### Validacao

- [ ] Fazer pergunta que requer múltiplos tópicos e verificar buscas adicionais do agente
- [ ] Encerrar sessão, reiniciar e verificar que o histórico é recuperado
- [ ] Gerar exercício, responder errado e verificar explicação do tutor
- [ ] Verificar que exercícios são sempre baseados no material indexado

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
