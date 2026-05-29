# Analisador de Contratos

Recebe um contrato (texto colado ou PDF) e gera uma análise jurídica estruturada com streaming.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK · pdf-parse | **Nivel:** 1 — Iniciante

---

## Descricao

Aplicação web (Fastify) onde o usuário cola o texto de um contrato ou faz upload de um PDF e escolhe o tipo de análise: pontos de risco, obrigações das partes ou resumo executivo. O backend extrai o texto do PDF com `pdf-parse`, injeta no prompt e retorna a análise via streaming (SSE). Introduz prompt engineering com contexto jurídico, upload de arquivo com `@fastify/multipart` e variação de tom por tipo de análise.

---

## Regras de Negocio

- O usuário pode enviar o contrato de duas formas: texto colado no textarea ou upload de arquivo PDF.
- Se ambos forem enviados, o PDF tem prioridade.
- O texto extraído (ou colado) deve ter no mínimo 300 e no máximo 80.000 caracteres.
- PDF deve ter no máximo 10 MB.
- Três modos de análise disponíveis: `riscos` (lista de cláusulas problemáticas), `obrigacoes` (o que cada parte deve fazer) e `resumo` (visão executiva do contrato).
- A análise deve se basear exclusivamente no texto fornecido — sem inferências externas.
- O sistema deve identificar o tipo de contrato automaticamente (prestação de serviço, compra e venda, locação etc.) e mencionar no início da resposta.
- Não deve ser possível enviar duas análises simultâneas pelo mesmo cliente.

---

## Requisitos Funcionais

- [ ] RF01 — Interface web com textarea para colar o texto do contrato
- [ ] RF02 — Campo de upload de arquivo PDF como alternativa ao textarea
- [ ] RF03 — Seletor de modo: riscos, obrigações ou resumo executivo
- [ ] RF04 — Botão "Analisar" que envia os dados via `fetch` com `FormData` (sem reload)
- [ ] RF05 — Exibição da análise em streaming (Server-Sent Events)
- [ ] RF06 — Botão "Copiar" que copia o resultado para o clipboard
- [ ] RF07 — Contador de caracteres em tempo real no textarea
- [ ] RF08 — Indicador visual do nome do arquivo PDF selecionado
- [ ] RF09 — Mensagem de erro amigável para texto fora do limite ou PDF inválido
- [ ] RF10 — `GET /health` retorna status do servidor

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — `OPENROUTER_API_KEY` via variável de ambiente, nunca no código
- [ ] RNF03 — Tratamento de erros: retornar `{ error }` com status HTTP correto
- [ ] RNF04 — Fastify com `@fastify/cors`, `@fastify/static` e `@fastify/multipart`
- [ ] RNF05 — Botão desabilitado durante o processamento
- [ ] RNF06 — PDF processado em memória (sem salvar em disco)

---

## Estrutura de Arquivos

```text
analisador-contratos/
├── src/
│   ├── server.ts          # Fastify + registro de rotas e plugins
│   ├── routes/
│   │   └── analisar.ts    # POST /analisar com multipart + streaming SSE
│   ├── services/
│   │   ├── llm.ts         # Wrapper do OpenRouter SDK
│   │   └── pdf.ts         # Extração de texto do PDF com pdf-parse
│   ├── prompts.ts         # Templates de prompt por modo de análise
│   └── types.ts           # Interfaces: AnaliseRequest, ModoAnalise
├── public/
│   ├── index.html         # Interface única
│   └── style.css          # Estilos
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] `npm init -y` e configurar `tsconfig.json` com `strict: true`
- [ ] Instalar: `npm i fastify @fastify/cors @fastify/static @fastify/multipart openai pdf-parse dotenv`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node @types/pdf-parse`
- [ ] Criar `.env` com `OPENROUTER_API_KEY`
- [ ] Scripts: `"dev": "tsx src/server.ts"`, `"build": "tsc"`

### Servidor

- [ ] Criar `src/server.ts` com Fastify, registrar plugins (`@fastify/cors`, `@fastify/static`, `@fastify/multipart`) e iniciar na porta 3000
- [ ] Criar `GET /health` retornando `{ status: "ok" }`
- [ ] Servir `public/` como arquivos estáticos na raiz `/`

### PDF e LLM

- [ ] Implementar `services/pdf.ts` com `extrairTexto(buffer: Buffer): Promise<string>` usando `pdf-parse`
- [ ] Implementar `services/llm.ts` com `streamAnalise(prompt: string): AsyncIterable<string>`
- [ ] Implementar `prompts.ts` com `getPrompt(texto: string, modo: ModoAnalise): string`
- [ ] Implementar `routes/analisar.ts` com `POST /analisar` que:
  - Recebe `multipart/form-data` com campos `modo`, `texto` (opcional) e `arquivo` (opcional, PDF)
  - Se `arquivo` presente: lê o buffer e chama `extrairTexto()`; senão usa `texto`
  - Valida que o texto resultante está entre 300 e 80.000 chars
  - Valida que o PDF não ultrapassa 10 MB
  - Abre resposta SSE com `reply.raw`
  - Faz stream do OpenRouter e escreve cada token com `reply.raw.write()`
  - Fecha com `reply.raw.end()`

### Frontend

- [ ] Criar layout com textarea, input de arquivo PDF, seletor de modo e área de resultado
- [ ] Ao selecionar PDF: exibir nome do arquivo e desabilitar o textarea (e vice-versa)
- [ ] Enviar dados via `fetch` com `FormData` (suporta texto e arquivo no mesmo request)
- [ ] Contador de caracteres no textarea com alerta visual nos limites (300 / 80.000)
- [ ] Consumir SSE com `fetch` + `ReadableStream`
- [ ] Desabilitar botão durante request e reabilitar ao final
- [ ] Botão "Copiar" com feedback visual ("Copiado!")

### Validacao

- [ ] Testar com texto de 100 chars (deve rejeitar com mensagem de erro)
- [ ] Testar com PDF válido de contrato nos 3 modos
- [ ] Testar com PDF acima de 10 MB (deve rejeitar)
- [ ] Testar com PDF de imagem escaneada sem texto (deve retornar erro amigável)
- [ ] Verificar que o tipo de contrato é identificado na resposta
- [ ] Verificar que o streaming exibe o texto progressivamente

---

## Como funciona o upload e extração de PDF

O frontend envia um `FormData` com o arquivo. O Fastify recebe via `@fastify/multipart`, lê o buffer em memória e o `pdf-parse` extrai o texto puro — sem salvar nada em disco.

```typescript
// services/pdf.ts
import pdfParse from "pdf-parse";

export async function extrairTexto(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  const texto = data.text.trim();
  if (!texto) throw new Error("O PDF não contém texto extraível.");
  return texto;
}
```

```typescript
// routes/analisar.ts (trecho de leitura do multipart)
const parts = request.parts();
let texto = "";
let modo: ModoAnalise = "resumo";

for await (const part of parts) {
  if (part.type === "field" && part.fieldname === "modo") {
    modo = part.value as ModoAnalise;
  } else if (part.type === "field" && part.fieldname === "texto") {
    texto = part.value as string;
  } else if (part.type === "file" && part.fieldname === "arquivo") {
    const chunks: Buffer[] = [];
    for await (const chunk of part.file) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    if (buffer.byteLength > 10 * 1024 * 1024) {
      return reply.status(400).send({ error: "PDF maior que 10 MB." });
    }
    texto = await extrairTexto(buffer);
  }
}
```

---

## Exemplo de Prompts

```typescript
type ModoAnalise = "riscos" | "obrigacoes" | "resumo";

const PROMPTS: Record<ModoAnalise, string> = {
  riscos:
    "Analise o contrato abaixo e liste os principais pontos de risco para as partes envolvidas. " +
    "Identifique cláusulas abusivas, prazos problemáticos ou obrigações desproporcionais. " +
    "Comece identificando o tipo de contrato.",
  obrigacoes:
    "Analise o contrato abaixo e liste, de forma clara, as obrigações de cada parte. " +
    "Separe por seções: 'Parte A deve:' e 'Parte B deve:'. " +
    "Comece identificando o tipo de contrato.",
  resumo:
    "Faça um resumo executivo do contrato abaixo em até 3 parágrafos: " +
    "1) tipo e objetivo do contrato, 2) principais condições, 3) pontos de atenção. " +
    "Use linguagem acessível, sem jargões.",
};
```

---

## Como funciona o OpenRouter

O OpenRouter usa a mesma interface do SDK da OpenAI — só muda a `baseURL` e a `apiKey`.

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = "anthropic/claude-sonnet-4-6";
```

---

## Como executar

```bash
cp .env.example .env
# edite .env com OPENROUTER_API_KEY

npm install
npm run dev
# Acesse http://localhost:3000
```
