# 01 — Calculadora Conversacional

Tool use básico: a LLM decide quando chamar uma ferramenta de cálculo.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK
**Conceito:** Definição de ferramenta, detecção de `tool_calls`, execução e reenvio

---

## Descricao

API de chat onde a LLM tem acesso a duas ferramentas: `calcular` (expressões matemáticas)
e `converter_unidade` (metros/pés, kg/lb, Celsius/Fahrenheit). Quando o usuário faz uma
pergunta que envolve cálculo, a LLM chama a ferramenta em vez de tentar calcular sozinha —
evitando erros matemáticos. Objetivo: entender o ciclo completo de tool use do início ao fim.

---

## Regras de Negocio

- A LLM deve usar `calcular` para qualquer operação matemática, nunca calcular sozinha.
- A LLM deve usar `converter_unidade` para conversões de unidades.
- Se a ferramenta retornar erro (divisão por zero, unidade inválida), a LLM deve informar o usuário.
- O histórico da conversa é mantido pelo cliente e reenviado a cada request.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /chat` com `{ mensagens: Message[] }` — processa tool use internamente
- [ ] RF02 — `GET /ferramentas` — lista as ferramentas disponíveis com descrição
- [ ] RF03 — Resposta final em texto, sem expor os detalhes do tool use ao cliente
- [ ] RF04 — `POST /chat/debug` — mesma lógica mas retorna `{ resposta, toolCalls[] }` para depuração

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — Ferramentas implementadas com lógica segura (sem `eval`)
- [ ] RNF03 — Loop de tool use limitado a 5 iterações por request (proteção)

---

## Estrutura de Arquivos

```text
01-calculadora/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── chat.ts
│   ├── tools/
│   │   ├── definitions.ts     # JSON Schema das ferramentas para a API
│   │   ├── calcular.ts        # Implementação: avaliador seguro de expressões
│   │   └── converterUnidade.ts
│   ├── services/
│   │   └── toolLoop.ts        # Loop: chamar API → executar tool → chamar API
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Como funciona o Loop de Tool Use

```typescript
// services/toolLoop.ts
async function toolLoop(mensagens: Message[]): Promise<string> {
  let iteracoes = 0;

  while (iteracoes < 5) {
    const resposta = await client.chat.completions.create({
      model: MODEL,
      messages: mensagens,
      tools: toolDefinitions,
    });

    const choice = resposta.choices[0];

    // LLM quer usar ferramenta
    if (choice.finish_reason === "tool_calls") {
      mensagens.push({ role: "assistant", ...choice.message });

      for (const toolCall of choice.message.tool_calls!) {
        const resultado = await executarFerramenta(toolCall);
        mensagens.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(resultado),
        });
      }
      iteracoes++;
      continue;
    }

    // LLM gerou resposta final
    return choice.message.content!;
  }

  throw new Error("Limite de iterações atingido");
}
```

---

## Tarefas

### Ferramentas

- [ ] `tools/definitions.ts`: array de tool definitions no formato OpenRouter/OpenAI
- [ ] `tools/calcular.ts`: parser seguro de expressões (use `mathjs` ou implemente com tokens)
- [ ] `tools/converterUnidade.ts`: conversões hardcoded para as unidades suportadas
- [ ] `tools/dispatcher.ts`: `executarFerramenta(toolCall) → resultado` com switch

### Servico e Rotas

- [ ] `services/toolLoop.ts`: implementar loop conforme pseudocódigo acima
- [ ] `routes/chat.ts`: `POST /chat` chama `toolLoop`, retorna resposta final
- [ ] `routes/chat.ts`: `POST /chat/debug` retorna resposta + array de `toolCalls` executados
- [ ] `GET /ferramentas`: retorna as definições das ferramentas

### Validacao

- [ ] "Quanto é 15% de 847.50?" — verificar que LLM usa `calcular`
- [ ] "Converta 100 metros em pés" — verificar que LLM usa `converter_unidade`
- [ ] "Qual a capital do Brasil?" — LLM responde sem usar ferramenta nenhuma
- [ ] Verificar que `POST /chat/debug` expõe os `toolCalls` com parâmetros

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
