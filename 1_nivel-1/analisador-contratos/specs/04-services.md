# Spec 04 — Serviços: PDF e LLM

## Objetivo

Implementar os dois serviços centrais: extração de texto de PDF e comunicação com a LLM via streaming.

## O que você vai aprender

- Como processar arquivos em memória (sem disco)
- O que é streaming de LLM e como funciona na prática
- Como usar o `@openrouter/sdk` com streaming
- O conceito de `AsyncIterable` em TypeScript

---

## Contexto: O que é streaming de LLM?

Quando você chama uma LLM sem streaming, espera a resposta inteira antes de mostrar qualquer coisa. Com streaming, o modelo envia tokens (pedaços de texto) conforme os gera — igual a como o ChatGPT exibe texto progressivamente.

Para contratos longos, a análise pode levar 10-20 segundos. Sem streaming, o usuário veria uma tela em branco. Com streaming, o texto aparece word-by-word, dando feedback imediato.

---

## Tarefas

### 1. Criar `src/services/pdf.ts`

```typescript
// src/services/pdf.ts
import pdfParse from "pdf-parse";

export async function extrairTexto(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  const texto = data.text.trim();

  if (!texto) {
    throw new Error("O PDF não contém texto extraível. PDFs escaneados como imagem não são suportados.");
  }

  return texto;
}
```

> **Por que "em memória"?**
> O buffer (`Buffer`) é um bloco de dados na RAM. O `pdf-parse` lê diretamente desse buffer sem criar arquivos temporários em disco. Isso é mais rápido, mais seguro (sem arquivos esquecidos) e obrigatório em ambientes serverless.

### 2. Criar `src/services/llm.ts`

Este é o coração da integração com IA. Usamos o `@openrouter/sdk` — o SDK oficial do OpenRouter, que tem a mesma interface do SDK da OpenAI mas com os headers de identificação já embutidos no construtor.

> **Referência:** [OpenRouter Client SDKs](https://openrouter.ai/docs/client-sdks/overview)

```typescript
// src/services/llm.ts
import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  httpReferer: process.env.SITE_URL ?? "http://localhost:3000",
  appTitle: process.env.SITE_NAME ?? "Analisador de Contratos",
});

const MODEL = "anthropic/claude-sonnet-4-6";

export async function* streamAnalise(prompt: string): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      yield token;
    }
  }
}
```

**Diferença do `openai` SDK:** Com `@openrouter/sdk`, os headers `HTTP-Referer` e `X-Title` vão direto no construtor como `httpReferer` e `appTitle` — sem precisar de `defaultHeaders`. A estrutura das respostas é idêntica.

**O que é `async function*` (generator)?**
Um generator é uma função que pode "pausar" e "retomar" — em vez de retornar um valor, ela `yield` (entrega) valores um a um. O `for await...of` no código que chama `streamAnalise` vai receber cada token conforme ele chega do modelo.

**Por que `chunk.choices[0]?.delta?.content`?**
A API retorna um array `choices` (geralmente com 1 item). O `delta` contém o incremento — o texto novo naquele chunk. O `?.` é optional chaining: se qualquer parte for `undefined`, retorna `undefined` sem estourar erro.

### 3. Entender o fluxo completo

```text
Frontend → POST /analisar
  → Fastify lê o multipart
  → pdf.ts extrai o texto (se PDF)
  → prompts.ts monta o prompt
  → llm.ts abre stream com OpenRouter
  → cada token → reply.raw.write() → EventSource no browser
```

### 4. Testar o serviço LLM isoladamente (opcional mas recomendado)

Crie um script temporário `src/test-llm.ts` para validar antes de conectar ao servidor:

```typescript
import dotenv from "dotenv";
dotenv.config();

import { streamAnalise } from "./services/llm";
import { getPrompt } from "./prompts";

const textoTeste = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS
As partes acordam que a Contratada prestará serviços de desenvolvimento de software
pelo prazo de 12 meses, com pagamento mensal de R$ 5.000,00.
A Contratante pode rescindir sem aviso prévio. A Contratada não pode.
`.repeat(10); // repetir para ter mais de 300 chars

const prompt = getPrompt(textoTeste, "riscos");

(async () => {
  process.stdout.write("Resposta: ");
  for await (const token of streamAnalise(prompt)) {
    process.stdout.write(token);
  }
  console.log("\n\nFim.");
})();
```

Execute com: `npx tsx src/test-llm.ts`

---

## Critério de conclusão

- [ ] `src/services/pdf.ts` criado e compila sem erros
- [ ] `src/services/llm.ts` criado e compila sem erros
- [ ] Script de teste retorna resposta em streaming no terminal

## Próximo passo

Com os serviços prontos, vá para a [Spec 05 — Rota de Análise (POST /analisar)](./05-rota-analisar.md).
