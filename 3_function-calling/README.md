# Function Calling

Projetos focados em tool use / function calling com a API via OpenRouter.

**Stack base:** Node.js · TypeScript · Fastify · OpenRouter SDK

---

## O que e Function Calling

Function calling (ou tool use) permite que a LLM sinalize que quer chamar uma função
definida pelo desenvolvedor, em vez de responder em texto. O fluxo é:

```text
1. Você define as ferramentas (nome, descrição, parâmetros JSON Schema)
2. Envia mensagem + definições das ferramentas para a API
3. A LLM decide se usa uma ferramenta e retorna: { tool_use: { name, input } }
4. Você executa a função com os parâmetros fornecidos
5. Envia o resultado de volta como mensagem de role "tool"
6. A LLM gera a resposta final usando o resultado
```

```typescript
// Definição de ferramenta (formato OpenRouter/OpenAI)
const tools = [{
  type: "function",
  function: {
    name: "buscarClima",
    description: "Retorna a temperatura atual de uma cidade",
    parameters: {
      type: "object",
      properties: {
        cidade: { type: "string", description: "Nome da cidade" }
      },
      required: ["cidade"]
    }
  }
}];

// A LLM retorna quando quer usar a ferramenta:
// { finish_reason: "tool_calls", tool_calls: [{ function: { name, arguments } }] }

// Você executa e reenvia:
messages.push({ role: "tool", tool_call_id: "...", content: JSON.stringify(resultado) });
```

---

## Projetos

| # | Projeto | Ferramentas | Conceito |
|---|---------|-------------|---------|
| 1 | [Calculadora Conversacional](./01-calculadora/) | `calcular`, `converter_unidade` | Tool use básico, uma ferramenta por vez |
| 2 | [Assistente de Dados](./02-assistente-dados/) | `filtrar`, `agrupar`, `ordenar`, `calcular_estatistica` | Múltiplas ferramentas em sequência |
| 3 | [Agente de Calendário](./03-calendario/) | `listar_eventos`, `criar_evento`, `cancelar_evento` | Ferramentas com side effects |
| 4 | [Extrator Estruturado](./04-extrator-estruturado/) | `salvar_pessoa`, `salvar_empresa`, `salvar_contato` | Forced tool use para structured output |
| 5 | [Orquestrador de APIs](./05-orquestrador-apis/) | `buscar_cep`, `buscar_produto`, `calcular_frete` | Encadeamento de ferramentas reais |

---

## Progressao dos Conceitos

```text
Projeto 1 — tool use básico: uma ferramenta, resultado imediato
    ↓
Projeto 2 — múltiplas ferramentas: LLM escolhe qual e quando usar cada uma
    ↓
Projeto 3 — side effects: ferramentas que modificam estado (não só leitura)
    ↓
Projeto 4 — forced tool use: forçar a LLM a usar a ferramenta para structured output
    ↓
Projeto 5 — encadeamento: resultado de uma ferramenta alimenta a próxima
```

---

## Diferenca entre Function Calling e RAG

| | Function Calling | RAG |
|---|---|---|
| Quando usar | Ações, cálculos, APIs externas | Perguntas sobre documentos |
| Como funciona | LLM chama funções com parâmetros | LLM recebe trechos de texto como contexto |
| Output | Resultado estruturado da função | Resposta gerada com base nos chunks |
| Exemplos | Criar evento, buscar clima, calcular | Resumir documento, responder sobre contrato |
