# 09 — Agente com Tool Use

Loop agêntico completo: Claude decide quando usar ferramentas, LangGraph orquestra o ciclo.

**Stack:** Node.js · TypeScript · Fastify · Next.js · LangGraph.js · Claude API
**Conceito:** ToolNode, createReactAgent, loop tool_use → executar → tool_use, streaming

---

## Descricao

Agente de produtividade pessoal com acesso a ferramentas reais: calculadora, conversor de moedas,
busca no calendário e consulta de clima. O usuário faz pedidos em linguagem natural e o agente
decide quais ferramentas usar, em que ordem e quantas vezes. Demonstra o padrão ReAct (Reason +
Act) implementado com LangGraph e a diferença entre `createReactAgent` (pronto) vs implementação
manual do loop.

---

## Conceitos Ensinados

- `ToolNode` do LangGraph que executa ferramentas automaticamente
- `createReactAgent(model, tools)` — helper que monta o grafo ReAct
- Como o loop funciona: `agent → tools (se tool_use) → agent → ...`
- Implementar o mesmo loop manualmente para entender o mecanismo
- Streaming de eventos do loop agêntico para o frontend

---

## Estrutura do Grafo (Manual para aprendizado)

```text
[START]
  ↓
[agente]               → Claude com tools, retorna tool_use ou text
  ↓ condicional
  ├── tool_use → [executarFerramentas]  → [agente]  ← ciclo
  └── text     → [END]
```

---

## Ferramentas Disponíveis

```typescript
const ferramentas = [
  calcular(expressao: string),         // eval seguro de expressões matemáticas
  converterMoeda(valor, de, para),     // taxa de câmbio mock
  buscarCalendario(data),              // retorna eventos do dia (dados mock)
  consultarClima(cidade),              // clima mock
];
```

---

## Tarefas

### Ferramentas

- [ ] Implementar as 4 ferramentas com tipos e descrições claras para a LLM
- [ ] Criar tool definitions no formato Anthropic SDK (`input_schema`)

### Parte 1 — createReactAgent

- [ ] Usar `createReactAgent` para montar o grafo em 5 linhas
- [ ] Testar com pedidos que exigem múltiplas ferramentas

### Parte 2 — Implementacao Manual

- [ ] Implementar o mesmo grafo manualmente com `ToolNode` e `addConditionalEdges`
- [ ] Verificar que o comportamento é idêntico ao `createReactAgent`
- [ ] Comparar os dois e entender o que `createReactAgent` abstrai

### Frontend

- [ ] Chat com painel lateral mostrando tool calls em tempo real
- [ ] Cada tool call exibe: ferramenta, parâmetros e resultado

### Validacao

- [ ] "Quanto é 15% de 847.50?" → usa calculadora
- [ ] "Tenho reuniões hoje?" → usa calendário
- [ ] "Quanto está o dólar hoje? Quero converter R$500" → usa moeda + calculadora
- [ ] Verificar que o agente para quando tem a resposta (não faz tool calls desnecessários)

---

## Como executar

```bash
npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
