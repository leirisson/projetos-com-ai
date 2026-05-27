# 03 — Agente de Calendario

Ferramentas com side effects: a LLM cria, lista e cancela eventos reais no banco.

**Stack:** Node.js · TypeScript · Fastify · PostgreSQL · OpenRouter SDK
**Conceito:** Ferramentas com side effects, confirmação antes de executar, idempotência

---

## Descricao

Assistente de calendário via chat. O usuário faz pedidos em linguagem natural ("marque uma reunião
com João amanhã às 14h") e a LLM usa ferramentas para interagir com o banco de dados de eventos.
Antes de criar ou cancelar eventos, o sistema exibe uma confirmação ao usuário — tool use com
side effects exige confirmação humana antes de executar ações irreversíveis.

---

## Regras de Negocio

- Ferramentas de leitura (`listar_eventos`, `buscar_evento`) executam direto.
- Ferramentas de escrita (`criar_evento`, `cancelar_evento`) retornam primeiro um preview para confirmação.
- O usuário confirma via `POST /chat/:id/confirmar` antes da execução real.
- Eventos criados pela LLM têm `criadoPorIA: true` no banco.
- Cancelamento é soft delete — o evento fica no banco com `cancelado: true`.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /chat` com `{ mensagem: string, sessionId: string }`
- [ ] RF02 — Quando a LLM quer criar/cancelar: retornar `{ status: "aguardando_confirmacao", preview: {...} }`
- [ ] RF03 — `POST /chat/confirmar` com `{ sessionId, confirmado: boolean }`
- [ ] RF04 — `GET /eventos` — lista eventos do banco com filtros de data
- [ ] RF05 — `GET /eventos/:id` — detalhes de um evento

---

## Ferramentas Disponíveis

```typescript
listar_eventos(dataInicio: string, dataFim: string)
  → Evento[]    // leitura direta

buscar_evento(query: string)
  → Evento[]    // busca por título/participante

criar_evento(titulo: string, inicio: string, fim: string, participantes: string[])
  → { preview: Evento }    // requer confirmação

cancelar_evento(eventoId: string, motivo?: string)
  → { preview: { evento: Evento, motivo: string } }    // requer confirmação
```

---

## Estrutura de Arquivos

```text
03-calendario/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── chat.ts
│   │   └── eventos.ts
│   ├── tools/
│   │   ├── definitions.ts
│   │   ├── listarEventos.ts
│   │   ├── buscarEvento.ts
│   │   ├── criarEvento.ts
│   │   └── cancelarEvento.ts
│   ├── services/
│   │   └── toolLoop.ts       # Versão com suporte a confirmação
│   ├── store/
│   │   └── pendingActions.ts # Map sessionId → ação pendente
│   └── db/
│       └── schema.prisma
├── docker-compose.yml
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Fluxo de Confirmacao

```text
1. POST /chat { mensagem: "cancele a reunião de amanhã" }
   ← { status: "aguardando_confirmacao", preview: { evento: {...} } }

2. POST /chat/confirmar { sessionId: "...", confirmado: true }
   ← { status: "concluido", resposta: "Reunião cancelada com sucesso." }

3. POST /chat/confirmar { sessionId: "...", confirmado: false }
   ← { status: "concluido", resposta: "Ok, nenhuma alteração feita." }
```

---

## Tarefas

### Banco

- [ ] Docker Compose com PostgreSQL 16
- [ ] Schema `eventos`: `id`, `titulo`, `inicio`, `fim`, `participantes`, `criadoPorIA`, `cancelado`
- [ ] Drizzle-orm com migrations

### Ferramentas e Confirmacao

- [ ] Ferramentas de leitura: executam e retornam direto
- [ ] Ferramentas de escrita: retornam `{ requiresConfirmation: true, preview }` sem executar
- [ ] `toolLoop.ts`: detecta `requiresConfirmation`, salva ação em `pendingActions` e retorna ao cliente
- [ ] `POST /chat/confirmar`: recupera ação pendente, executa ou descarta

### Validacao

- [ ] "Liste meus eventos de hoje" — executa sem confirmação
- [ ] "Crie uma reunião amanhã às 10h" — retorna preview e aguarda confirmação
- [ ] Confirmar → verificar evento criado no banco
- [ ] Rejeitar → verificar que nenhum evento foi criado

---

## Como executar

```bash
docker compose up -d
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
