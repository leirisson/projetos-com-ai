# 04 — Extrator Estruturado

Forced tool use para garantir structured output tipado a partir de texto livre.

**Stack:** Node.js · TypeScript · Fastify · PostgreSQL · OpenRouter SDK
**Conceito:** Forced tool use (`tool_choice: "required"`), extração sem texto livre, validação Zod

---

## Descricao

API que recebe textos não estruturados (e-mails, mensagens, documentos) e extrai
entidades específicas (pessoas, empresas, contatos) de forma garantida em JSON tipado.
Em vez de pedir à LLM para responder em JSON (que pode falhar), usa `tool_choice: "required"`
para forçar o uso de uma ferramenta específica — a resposta é sempre estruturada ou erro.

---

## Regras de Negocio

- A LLM é forçada a chamar a ferramenta de extração (não pode responder em texto).
- Campos com `required: true` no schema devem estar presentes ou retornar `null` explícito.
- Cada campo extraído tem um `confidence` (0.0–1.0) calculado pelo prompt.
- O texto original é salvo junto com a extração para auditoria.
- Suporte a 3 tipos de entidade: `pessoa`, `empresa`, `contato`.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /extrair` com `{ texto: string, tipo: "pessoa" | "empresa" | "contato" }`
- [ ] RF02 — `POST /extrair/lote` com `{ itens: Array<{ texto, tipo }> }`
- [ ] RF03 — `GET /extracoes` — lista extrações salvas com filtro por tipo
- [ ] RF04 — `GET /extracoes/:id` — detalhe de uma extração com texto original

---

## Ferramentas (uma por tipo)

```typescript
// Ferramenta usada com tool_choice: "required" e tool_choice.function.name: "salvar_pessoa"
salvar_pessoa({
  nome: string,             // required
  email: string | null,
  telefone: string | null,
  cargo: string | null,
  empresa: string | null,
  confidence: number        // 0.0 a 1.0
})

salvar_empresa({
  razaoSocial: string,      // required
  cnpj: string | null,
  setor: string | null,
  site: string | null,
  confidence: number
})

salvar_contato({
  nome: string,             // required
  canal: "email" | "telefone" | "whatsapp" | "linkedin",
  valor: string,            // required — o endereço/número
  confidence: number
})
```

---

## Estrutura de Arquivos

```text
04-extrator-estruturado/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── extrair.ts
│   ├── tools/
│   │   ├── definitions.ts      # Schema de cada ferramenta
│   │   └── dispatcher.ts       # Salva no banco ao ser chamada
│   ├── services/
│   │   └── extractor.ts        # Chama API com tool_choice: "required"
│   └── db/
│       └── schema.ts
├── docker-compose.yml
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Como funciona o Forced Tool Use

```typescript
// services/extractor.ts
const resposta = await client.chat.completions.create({
  model: MODEL,
  messages: [
    { role: "system", content: "Extraia os dados do texto usando a ferramenta fornecida." },
    { role: "user",   content: texto }
  ],
  tools: [toolDefinitions[tipo]],
  tool_choice: {
    type: "function",
    function: { name: `salvar_${tipo}` }   // força esta ferramenta específica
  },
});

// Sempre haverá tool_calls — não precisa verificar finish_reason
const toolCall = resposta.choices[0].message.tool_calls![0];
const dados = JSON.parse(toolCall.function.arguments);
// dados é garantidamente tipado conforme o schema da ferramenta
```

---

## Tarefas

### Banco

- [ ] Docker Compose com PostgreSQL
- [ ] Tabelas `pessoas`, `empresas`, `contatos` com campo `textoOriginal` e `confidence`

### Ferramentas e Extrator

- [ ] `tools/definitions.ts`: schema JSON completo de cada ferramenta
- [ ] `services/extractor.ts`: chamada com `tool_choice: "required"` e parse do resultado
- [ ] Validação Zod do output antes de salvar no banco

### Rotas

- [ ] `POST /extrair`: chama extractor, salva no banco, retorna entidade criada
- [ ] `POST /extrair/lote`: processa itens em paralelo (máx 5 simultâneos)

### Validacao

- [ ] Extrair pessoa de: "Fale com a Maria Silva, gerente de TI, maria@empresa.com"
- [ ] Extrair empresa de e-mail de contrato com CNPJ no corpo
- [ ] Verificar que campos ausentes chegam como `null` (não como string "null")
- [ ] Verificar que a ferramenta é sempre chamada — nunca texto livre na resposta

---

## Como executar

```bash
docker compose up -d
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
