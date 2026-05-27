# Assistente de Codigo

API REST que revisa, explica e sugere melhorias em trechos de código.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK | **Nivel:** 2 — Intermediario

---

## Descricao

API Fastify que recebe código-fonte e uma ação (`revisar`, `explicar`, `melhorar`) e retorna
a análise via streaming. Detecta a linguagem automaticamente pela extensão. O histórico de
análises é salvo por `sessionId` para consulta posterior. Introduz Fastify com multipart
(upload de arquivo), streaming SSE e persistência simples em disco.

---

## Regras de Negocio

- A linguagem é detectada pela extensão do arquivo enviado.
- No modo `melhorar`, a resposta deve conter o código reescrito em bloco de código separado.
- No modo `revisar`, os problemas devem ser categorizados por severidade: `CRITICO`, `AVISO`, `SUGESTAO`.
- Arquivos maiores que 500 linhas são truncados com aviso no response header.
- O histórico de análises fica disponível por `sessionId` durante 24h.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /analisar` com multipart: campo `arquivo` (file) + campo `acao` (string)
- [ ] RF02 — Opção de query param `?linhas=10-50` para analisar apenas um trecho
- [ ] RF03 — Resposta via SSE com streaming token a token
- [ ] RF04 — `GET /historico/:sessionId` — lista análises da sessão
- [ ] RF05 — `GET /historico/:sessionId/:id` — retorna análise completa salva
- [ ] RF06 — `GET /linguagens` — lista linguagens suportadas

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — `@fastify/multipart` para receber o arquivo de código
- [ ] RNF03 — Suporte às linguagens: TypeScript, JavaScript, Go, Ruby, Java, Python
- [ ] RNF04 — Análises salvas em `.historico/<sessionId>/<timestamp>.json` (gitignored)
- [ ] RNF05 — Header `X-Truncated: true` quando o arquivo for cortado em 500 linhas
- [ ] RNF06 — Timeout de 60s por request de análise

---

## Estrutura de Arquivos

```text
assistente-codigo/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── analisar.ts        # POST /analisar com multipart + SSE
│   │   └── historico.ts       # GET /historico/:sessionId
│   ├── services/
│   │   ├── analyzer.ts        # Chamada ao OpenRouter com streaming
│   │   ├── prompts.ts         # Templates de prompt por ação
│   │   └── history.ts         # Leitura e escrita do histórico em disco
│   ├── languages.ts           # Map extensão -> linguagem
│   └── types.ts               # Acao, Linguagem, HistoricoEntry, AnalysisRequest
├── exemplos/
│   ├── exemplo.ts
│   ├── exemplo.js
│   └── exemplo.go
├── .historico/                # Gitignored
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Contrato da API

```typescript
// POST /analisar
// Content-Type: multipart/form-data
// Fields: arquivo (File), acao ("revisar"|"explicar"|"melhorar"), sessionId (string)
// Query: ?linhas=10-50  (opcional)
// Response: SSE — tokens da análise
// Headers: X-Truncated: "true" se arquivo > 500 linhas

// GET /historico/:sessionId
// Response: { entradas: HistoricoEntry[] }

// GET /historico/:sessionId/:id
// Response: { conteudo: string, arquivo: string, acao: string, criadoEm: string }
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i fastify @fastify/multipart @fastify/cors openai dotenv`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`

### Servidor

- [ ] `server.ts`: Fastify, registrar `@fastify/multipart` e `@fastify/cors`
- [ ] `languages.ts`: `Record<string, string>` de extensão → nome da linguagem

### Rotas

- [ ] `routes/analisar.ts`: receber multipart, ler arquivo, extrair range de linhas, abrir SSE
- [ ] Definir header `X-Truncated` quando necessário antes de abrir o stream
- [ ] `routes/historico.ts`: ler arquivos de `.historico/<sessionId>/`

### Servicos

- [ ] `services/prompts.ts`: prompt especializado para cada ação com severidades fixas
- [ ] `services/analyzer.ts`: `stream(code, language, acao): AsyncIterable<string>`
- [ ] `services/history.ts`: `save(sessionId, entry)` e `list(sessionId)`

### Validacao

- [ ] Upload de `exemplos/exemplo.ts` com `acao=revisar` — verificar categorias no stream
- [ ] Upload com `?linhas=1-20` — verificar que só as linhas do range são analisadas
- [ ] Arquivo de 600 linhas — verificar header `X-Truncated: true`
- [ ] `GET /historico/:sessionId` após 3 análises — verificar lista

---

## Exemplos de Uso

```bash
# Revisar arquivo
curl -X POST http://localhost:3001/analisar \
  -F "arquivo=@exemplos/exemplo.ts" \
  -F "acao=revisar" \
  -F "sessionId=minha-sessao"

# Analisar trecho
curl "http://localhost:3001/analisar?linhas=1-30" \
  -X POST -F "arquivo=@exemplos/exemplo.go" -F "acao=explicar" -F "sessionId=minha-sessao"

# Histórico
curl http://localhost:3001/historico/minha-sessao
```

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
