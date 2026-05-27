# 05 — Orquestrador de APIs

Encadeamento de ferramentas que chamam APIs reais: resultado de uma alimenta a próxima.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK
**Conceito:** Ferramentas que chamam APIs HTTP externas, encadeamento com dependência de dados

---

## Descricao

Assistente de e-commerce que responde perguntas como "Quanto fica o frete para enviar o produto X
para o CEP 01310-100?" encadeando 3 APIs reais: busca o produto pelo nome, busca o endereço pelo CEP,
e calcula o frete com os dados dos dois. A LLM decide a sequência correta sem instrução explícita.
Demonstra o padrão mais próximo de produção: ferramentas que fazem I/O real.

---

## Regras de Negocio

- Ferramentas chamam APIs HTTP externas com timeout de 5s e retry de 1 vez.
- Se uma API falhar, a ferramenta retorna `{ error: string }` — a LLM informa o usuário.
- Os resultados de ferramentas são cacheados por 5 minutos para evitar chamadas redundantes.
- A LLM não deve inventar dados de produto, endereço ou frete — tudo vem das ferramentas.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /chat` com `{ mensagem: string, sessionId: string }`
- [ ] RF02 — `GET /cache/stats` — quantidade de entradas em cache por ferramenta
- [ ] RF03 — `DELETE /cache` — limpa o cache (útil para testes)
- [ ] RF04 — `POST /chat/debug` — retorna resposta + tool calls com latência de cada chamada

---

## Ferramentas Disponíveis

```typescript
buscar_produto(nome: string)
  → { id, nome, preco, peso_kg, dimensoes: { cm3 } }
  // API: ViaCEP-like mock ou produto do próprio banco

buscar_cep(cep: string)
  → { logradouro, bairro, cidade, estado, lat, lng }
  // API: ViaCEP (gratuita, sem chave)  https://viacep.com.br/ws/{cep}/json/

calcular_frete(peso_kg: number, cep_destino: string, cep_origem?: string)
  → { valor: number, prazo_dias: number, transportadora: string }
  // API: mock (simula Correios/Melhor Envio)
```

---

## Estrutura de Arquivos

```text
05-orquestrador-apis/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── chat.ts
│   │   └── cache.ts
│   ├── tools/
│   │   ├── definitions.ts
│   │   ├── buscarProduto.ts       # Busca em produtos.json local
│   │   ├── buscarCep.ts           # Chama ViaCEP
│   │   ├── calcularFrete.ts       # Mock de frete
│   │   └── dispatcher.ts
│   ├── services/
│   │   ├── toolLoop.ts
│   │   └── cache.ts               # Map com TTL de 5min
│   ├── dados/
│   │   └── produtos.json          # 20 produtos fictícios com peso e dimensões
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Ferramentas

- [ ] `buscarProduto.ts`: busca em `produtos.json` por nome (fuzzy match simples)
- [ ] `buscarCep.ts`: `fetch` para `https://viacep.com.br/ws/${cep}/json/` com timeout 5s e retry 1x
- [ ] `calcularFrete.ts`: mock que simula cálculo baseado em peso e distância (CEPs de SP = mais barato)
- [ ] `services/cache.ts`: `Map<string, { valor, expiraEm }>` com TTL de 5 minutos

### Loop e Rotas

- [ ] `toolLoop.ts`: adicionar medição de latência por tool call (`Date.now()` antes e depois)
- [ ] `routes/chat.ts`: `POST /chat` e `POST /chat/debug`
- [ ] `routes/cache.ts`: `GET /cache/stats` e `DELETE /cache`

### Validacao

- [ ] "Quanto fica o frete do notebook X para o CEP 01310-100?" — verificar encadeamento
- [ ] Segunda pergunta sobre o mesmo CEP — verificar que usa o cache (latência < 10ms)
- [ ] Simular falha da ViaCEP com CEP inválido — verificar mensagem de erro amigável
- [ ] `POST /chat/debug` — verificar latências de cada tool call

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001

# Teste rápido:
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Quanto fica o frete do notebook pro CEP 01310-100?", "sessionId": "teste"}'
```
