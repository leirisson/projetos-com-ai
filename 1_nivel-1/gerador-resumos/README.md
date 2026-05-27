# Gerador de Resumos

Recebe um texto longo e gera um resumo conciso usando a API do Claude com streaming.

**Stack:** Node.js · TypeScript · Express · OpenRouter SDK | **Nivel:** 1 — Iniciante

---

## Descricao

Uma aplicação web simples (Express) onde o usuário cola um texto longo e escolhe o nível de compressão (curto, médio, detalhado). O sistema retorna o resumo via streaming, exibindo o texto progressivamente. Introduz prompt engineering com parâmetros variáveis e integração frontend/backend em TypeScript.

---

## Regras de Negocio

- O texto de entrada deve ter no mínimo 200 e no máximo 50.000 caracteres.
- Três modos disponíveis: `curto` (1 parágrafo), `medio` (3 parágrafos), `detalhado` (com tópicos).
- O resumo deve preservar os pontos principais sem inventar informações.
- O sistema deve detectar o idioma do texto e responder no mesmo idioma.
- Não deve ser possível enviar dois resumos simultâneos pelo mesmo cliente.

---

## Requisitos Funcionais

- [ ] RF01 — Interface web com textarea para o texto de entrada
- [ ] RF02 — Seletor de modo: curto, médio ou detalhado
- [ ] RF03 — Botão "Gerar Resumo" que chama o backend via `fetch` (sem reload)
- [ ] RF04 — Exibição do resumo na mesma página com streaming (Server-Sent Events)
- [ ] RF05 — Botão "Copiar" que copia o resumo para o clipboard
- [ ] RF06 — Contador de caracteres em tempo real no textarea
- [ ] RF07 — Mensagem de erro amigável para textos fora do limite

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Backend Express com TypeScript, endpoint `POST /resumir`
- [ ] RNF02 — Frontend HTML + CSS + JS vanilla (sem frameworks)
- [ ] RNF03 — Botão desabilitado durante o processamento
- [ ] RNF04 — Streaming via `res.write()` (SSE) para exibir texto progressivamente
- [ ] RNF05 — Chave de API nunca exposta no frontend

---

## Estrutura de Arquivos

```text
gerador-resumos/
├── src/
│   ├── server.ts          # Servidor Express
│   ├── prompts.ts         # Templates de prompt por modo
│   └── types.ts           # Interfaces: ResumoRequest, Modo
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

- [ ] `npm init -y` e configurar `tsconfig.json`
- [ ] Instalar: `npm i express @anthropic-ai/sdk dotenv`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node @types/express`
- [ ] Adicionar scripts `"dev": "tsx src/server.ts"` e `"build": "tsc"`

### Backend

- [ ] Criar `src/server.ts` com rota `GET /` servindo o HTML e `POST /resumir`
- [ ] Criar `src/prompts.ts` com `getPrompt(texto: string, modo: Modo): string`
- [ ] Implementar streaming com `client.messages.stream()` e `res.write()`
- [ ] Validar tamanho do texto no backend (retornar `400` se inválido)
- [ ] Tipar o body do request com a interface `ResumoRequest`

### Frontend

- [ ] Criar layout com textarea, seletor de modo e área de resultado
- [ ] Contador de caracteres com alerta visual nos limites (200 / 50.000)
- [ ] Consumir SSE com `EventSource` ou `fetch` + `ReadableStream`
- [ ] Desabilitar botão durante request e reabilitar ao final
- [ ] Botão "Copiar" com feedback visual ("Copiado!")

### Validacao

- [ ] Testar com texto de 100 chars (deve rejeitar com mensagem)
- [ ] Testar com texto de 500 chars nos 3 modos
- [ ] Testar com texto em inglês (resumo deve sair em inglês)
- [ ] Verificar que o streaming exibe o texto progressivamente

---

## Exemplo de Prompts

```typescript
const PROMPTS: Record<Modo, string> = {
  curto:    "Resuma o texto a seguir em exatamente 1 parágrafo, capturando apenas a ideia central.",
  medio:    "Resuma o texto a seguir em 3 parágrafos: contexto, desenvolvimento e conclusão.",
  detalhado:"Resuma o texto a seguir em tópicos: 1 título, 3-5 tópicos principais e 1 conclusão.",
};
```

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# Acesse http://localhost:3000
```
