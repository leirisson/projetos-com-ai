# Gerador de Peticoes

Recebe dados do caso e gera o texto de uma petição jurídica no estilo do próprio usuário, com streaming.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK · pdf-parse | **Nivel:** 1 — Iniciante

---

## Descricao

Aplicação web (Fastify) onde o usuário preenche um formulário com o tipo de peça (reclamação trabalhista, petição inicial cível, recurso), os fatos do caso e o pedido desejado. Opcionalmente, faz upload de até 3 petições anteriores em PDF — o sistema extrai o texto, injeta como exemplos de estilo no prompt e gera a nova peça no mesmo tom e estrutura do usuário. Retorna via streaming (SSE). Introduz prompt engineering com few-shot examples e upload de múltiplos arquivos.

---

## Regras de Negocio

- O campo `fatos` deve ter no mínimo 100 e no máximo 5.000 caracteres.
- O campo `pedido` deve ter no mínimo 30 e no máximo 1.000 caracteres.
- Três tipos de peças disponíveis: `reclamacao_trabalhista`, `peticao_inicial_civel`, `recurso`.
- O usuário pode enviar de 0 a 3 PDFs de referência de estilo; sem PDFs, o sistema usa o template padrão.
- Cada PDF de referência deve ter no máximo 5 MB e o texto extraído não ultrapassa 10.000 chars por arquivo (truncado se maior).
- Os PDFs são processados em memória — nenhum arquivo é salvo em disco.
- O texto gerado deve seguir a estrutura formal de cada tipo de peça (cabeçalho, qualificação, dos fatos, do direito, do pedido).
- O sistema não inventa dados — usa apenas o que foi fornecido no formulário.
- O aviso "Este texto é uma sugestão gerada por IA e deve ser revisado por um advogado" deve aparecer ao final de toda geração.

---

## Requisitos Funcionais

- [ ] RF01 — Interface web com formulário: tipo de peça, fatos e pedido
- [ ] RF02 — Seletor de tipo: reclamação trabalhista, petição inicial cível, recurso
- [ ] RF03 — Campo de upload múltiplo de PDFs (até 3 arquivos) como base de estilo
- [ ] RF04 — Exibição dos nomes dos PDFs selecionados com botão de remoção individual
- [ ] RF05 — Botão "Gerar Petição" que envia os dados via `fetch` com `FormData` (sem reload)
- [ ] RF06 — Exibição do texto gerado em streaming (Server-Sent Events)
- [ ] RF07 — Botão "Copiar" que copia o resultado para o clipboard
- [ ] RF08 — Contador de caracteres nos campos `fatos` e `pedido`
- [ ] RF09 — Mensagem de erro amigável para campos fora do limite ou PDFs inválidos
- [ ] RF10 — `GET /health` retorna status do servidor

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — `OPENROUTER_API_KEY` via variável de ambiente, nunca no código
- [ ] RNF03 — Tratamento de erros: retornar `{ error }` com status HTTP correto
- [ ] RNF04 — Fastify com `@fastify/cors`, `@fastify/static` e `@fastify/multipart`
- [ ] RNF05 — Botão desabilitado durante o processamento
- [ ] RNF06 — PDFs processados em memória (sem salvar em disco)

---

## Estrutura de Arquivos

```text
gerador-peticoes/
├── src/
│   ├── server.ts          # Fastify + registro de rotas e plugins
│   ├── routes/
│   │   └── gerar.ts       # POST /gerar com multipart + streaming SSE
│   ├── services/
│   │   ├── llm.ts         # Wrapper do OpenRouter SDK
│   │   └── pdf.ts         # Extração de texto dos PDFs de referência
│   ├── templates.ts       # Templates de prompt por tipo de peça
│   └── types.ts           # GerarRequest, TipoPeca
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

- [ ] Criar `src/server.ts` com Fastify, registrar plugins (`@fastify/cors`, `@fastify/static`, `@fastify/multipart`) e iniciar na porta 3002
- [ ] Criar `GET /health` retornando `{ status: "ok" }`
- [ ] Servir `public/` como arquivos estáticos na raiz `/`

### PDF e LLM

- [ ] Implementar `services/pdf.ts` com `extrairTexto(buffer: Buffer, limite?: number): Promise<string>` usando `pdf-parse` (truncar em `limite` chars se fornecido)
- [ ] Implementar `services/llm.ts` com `streamGeracao(prompt: string): AsyncIterable<string>`
- [ ] Implementar `templates.ts` com `getTemplate(tipo: TipoPeca, fatos: string, pedido: string, exemplos: string[]): string` que injeta os exemplos como few-shot no system prompt
- [ ] Implementar `routes/gerar.ts` com `POST /gerar` que:
  - Recebe `multipart/form-data` com campos `tipo`, `fatos`, `pedido` e até 3 arquivos `referencias[]`
  - Para cada PDF: valida tamanho (≤ 5 MB), extrai texto via `extrairTexto()` com limite de 10.000 chars
  - Valida `fatos` e `pedido` nos limites de caracteres
  - Monta o prompt com `getTemplate()` passando os textos extraídos como exemplos
  - Abre resposta SSE com `reply.raw`, faz stream e fecha com `reply.raw.end()`

### Frontend

- [ ] Criar formulário com seletor de tipo, textarea de fatos, textarea de pedido e input de arquivo múltiplo (`multiple`, `accept=".pdf"`, `max 3`)
- [ ] Listar os PDFs selecionados com nome e botão "×" para remover individualmente
- [ ] Enviar via `fetch` com `FormData` (campos + arquivos no mesmo request)
- [ ] Contadores de caracteres com alerta visual nos limites
- [ ] Consumir SSE com `fetch` + `ReadableStream`
- [ ] Desabilitar botão durante request e reabilitar ao final
- [ ] Botão "Copiar" com feedback visual ("Copiado!")

### Validacao

- [ ] Testar sem PDFs de referência (deve usar template padrão)
- [ ] Testar com 1, 2 e 3 PDFs de referência e verificar que o estilo muda
- [ ] Testar com PDF acima de 5 MB (deve rejeitar)
- [ ] Testar com mais de 3 PDFs (deve rejeitar com mensagem de erro)
- [ ] Testar com `fatos` de 50 chars (deve rejeitar)
- [ ] Verificar estrutura da peça gerada (seções: Dos Fatos, Do Direito, Do Pedido)
- [ ] Verificar que o aviso de revisão aparece ao final

---

## Como funciona o few-shot com PDFs de referencia

Os PDFs enviados pelo usuário são extraídos e injetados no system prompt como exemplos de estilo. O modelo imita a estrutura, linguagem e tom das peças de referência ao gerar a nova petição.

```typescript
// templates.ts
export function getTemplate(
  tipo: TipoPeca,
  fatos: string,
  pedido: string,
  exemplos: string[]
): string {
  const blocoExemplos =
    exemplos.length > 0
      ? `A seguir estão ${exemplos.length} petição(ões) anteriores do usuário. ` +
        `Use-as APENAS como referência de estilo, linguagem e estrutura — não copie o conteúdo.\n\n` +
        exemplos.map((e, i) => `### Referência ${i + 1}\n${e}`).join("\n\n") +
        "\n\n---\n\n"
      : "";

  const estrutura: Record<TipoPeca, string> = {
    reclamacao_trabalhista: `Redija uma reclamação trabalhista com as seguintes seções:
I – DA QUALIFICAÇÃO DAS PARTES (use "[RECLAMANTE]" e "[RECLAMADA]" como placeholders)
II – DOS FATOS: ${fatos}
III – DO DIREITO (cite CLT e jurisprudência relevante)
IV – DOS PEDIDOS: ${pedido}
V – DO VALOR DA CAUSA`,

    peticao_inicial_civel: `Redija uma petição inicial cível com as seguintes seções:
I – DOS FATOS: ${fatos}
II – DO DIREITO (cite o Código Civil ou CDC conforme aplicável)
III – DOS PEDIDOS: ${pedido}
IV – DO VALOR DA CAUSA`,

    recurso: `Redija um recurso com as seguintes seções:
I – TEMPESTIVIDADE
II – DOS FATOS E DA DECISÃO RECORRIDA: ${fatos}
III – DAS RAZÕES DO RECURSO
IV – DO PEDIDO: ${pedido}`,
  };

  return (
    blocoExemplos +
    estrutura[tipo] +
    "\n\nAo final, adicione: 'AVISO: Este texto é uma sugestão gerada por IA e deve ser revisado por um advogado habilitado antes de qualquer uso.'"
  );
}
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
# Acesse http://localhost:3002
```
