# Agente de Pesquisa Autonomo

Agente que pesquisa na web de forma autônoma com tool use e sintetiza respostas fundamentadas com fontes.

**Stack:** Node.js · TypeScript · Fastify · Next.js · Claude API (tool use + agentic loop) | **Nivel:** 3 — Avancado

---

## Descricao

Um agente baseado em loop agêntico que decide por conta própria quando e como usar ferramentas de busca para responder a uma pergunta complexa. O backend em Fastify expõe a API agêntica e o frontend em Next.js exibe o raciocínio passo a passo em tempo real via SSE. Implementa o padrão agentic loop manualmente, sem frameworks como LangChain.

---

## Regras de Negocio

- O agente planeja explicitamente sub-perguntas antes de iniciar as buscas.
- Máximo de 10 chamadas de ferramenta por pergunta (limite de segurança).
- Cada rodada de busca retorna no máximo 5 resultados por query.
- A resposta final deve citar fontes com URL e título.
- Resultados com menos de 200 palavras são descartados como insuficientes.
- Perguntas sobre dados em tempo real devem ser respondidas com ressalva explícita.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /pesquisa` com `{ pergunta: string }` — inicia pesquisa e retorna `{ id }`
- [ ] RF02 — `GET /pesquisa/:id/stream` — SSE com eventos de raciocínio e resposta final
- [ ] RF03 — Ferramentas disponíveis: `buscarWeb(query)`, `buscarNoticias(query)`, `buscarWikipedia(termo)`
- [ ] RF04 — Frontend Next.js com campo de pergunta e painel de raciocínio ao vivo
- [ ] RF05 — Painel mostra cada tool call + resultado enquanto o agente trabalha
- [ ] RF06 — Resposta final exibida em destaque ao término com seção "Fontes"
- [ ] RF07 — `GET /pesquisa/:id` para recuperar resultado completo após conclusão

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true` (monorepo: `apps/api` + `apps/web`)
- [ ] RNF02 — Agentic loop implementado manualmente (sem LangChain/LlamaIndex)
- [ ] RNF03 — API de busca: Brave Search (gratuito até 2000 req/mês) ou DuckDuckGo scraping
- [ ] RNF04 — Timeout de 30s por iteração do loop
- [ ] RNF05 — Modelo `claude-opus-4-7` para máxima capacidade de raciocínio
- [ ] RNF06 — Frontend com TailwindCSS, sem bibliotecas de UI externas

---

## Estrutura de Arquivos

```text
agente-pesquisa/
├── apps/
│   ├── api/                       # Fastify backend
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── agent.ts           # Loop agêntico principal
│   │   │   ├── tools/
│   │   │   │   ├── definitions.ts # Tool definitions para a API Anthropic
│   │   │   │   ├── buscarWeb.ts
│   │   │   │   ├── buscarNoticias.ts
│   │   │   │   └── wikipedia.ts
│   │   │   └── types.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                       # Next.js frontend
│       ├── app/
│       │   ├── page.tsx           # Página principal
│       │   └── components/
│       │       ├── SearchForm.tsx
│       │       └── ReasoningPanel.tsx
│       ├── tsconfig.json
│       └── package.json
├── package.json                   # Workspace root
└── README.md
```

---

## Tarefas

### Setup

- [ ] Criar monorepo com `npm workspaces`
- [ ] API — instalar: `fastify @anthropic-ai/sdk dotenv axios`
- [ ] Web — criar com `create-next-app` + TailwindCSS

### Ferramentas (API)

- [ ] Implementar `buscarWeb.ts` com `buscar(query): Promise<Resultado[]>`
- [ ] Implementar `buscarNoticias.ts` com filtro de período
- [ ] Implementar `wikipedia.ts` com busca e extração de resumo
- [ ] Criar `definitions.ts` com as tool definitions no formato Anthropic SDK

### Loop Agentico (API)

- [ ] Implementar `agent.ts` com loop: `enquanto stop_reason === "tool_use" → executar tool → nova chamada`
- [ ] Dispatcher de ferramentas por `tool_name`
- [ ] Contador de iterações com limite de 10
- [ ] Emitir evento SSE a cada passo: `{ tipo: "tool_call" | "tool_result" | "resposta_final", payload }`

### Frontend (Next.js)

- [ ] `SearchForm.tsx`: input de pergunta + botão + estado de loading
- [ ] `ReasoningPanel.tsx`: consome SSE e renderiza cada evento em tempo real
- [ ] Exibir tool calls com nome da ferramenta e query usada
- [ ] Exibir resposta final com Markdown renderizado e lista de fontes clicáveis

### Validacao

- [ ] Testar com "Principais tendências de IA em 2025"
- [ ] Verificar que o painel de raciocínio atualiza em tempo real
- [ ] Verificar limite de 10 iterações
- [ ] Verificar que todas as fontes têm URL válida

---

## Como executar

```bash
npm install          # instala todos os workspaces

# Terminal 1 — API
npm run dev -w apps/api
# http://localhost:3001

# Terminal 2 — Web
npm run dev -w apps/web
# http://localhost:3000
```
