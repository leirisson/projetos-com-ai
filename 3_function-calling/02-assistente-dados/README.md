# 02 — Assistente de Dados

Múltiplas ferramentas de análise de dados: a LLM encadeia ferramentas em sequência.

**Stack:** Node.js · TypeScript · Fastify · OpenRouter SDK
**Conceito:** Múltiplas ferramentas, escolha sequencial, resultado de uma alimenta a outra

---

## Descricao

API que permite ao usuário fazer perguntas analíticas sobre um dataset em memória
(vendas, produtos, clientes). A LLM tem 4 ferramentas disponíveis e decide quais usar
e em que ordem para responder. Para "Quais os 3 produtos mais vendidos em SP?", ela pode
encadear: `filtrar(estado=SP)` → `agrupar(por=produto)` → `ordenar(desc)` → resposta.

---

## Regras de Negocio

- O dataset é carregado de `dados/vendas.json` ao iniciar o servidor.
- Ferramentas operam sobre o dataset em memória, nunca modificam os dados originais.
- Resultados de ferramentas intermediárias são passados para a próxima via histórico.
- A LLM nunca deve inventar dados — toda afirmação deve vir de uma ferramenta.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /perguntar` com `{ pergunta: string }` — processa internamente e retorna análise
- [ ] RF02 — `GET /dados/preview` — retorna as primeiras 5 linhas do dataset
- [ ] RF03 — `GET /dados/schema` — retorna os campos disponíveis com tipo e descrição
- [ ] RF04 — `POST /perguntar/debug` — retorna resposta + sequência de tool calls com inputs/outputs

---

## Ferramentas Disponíveis

```typescript
filtrar(campo: string, valor: string | number)
  → retorna subset dos dados onde campo === valor

agrupar(campo: string, operacao: "soma" | "contagem" | "media", campoValor?: string)
  → retorna { [grupo]: resultado }

ordenar(dados: object[], campo: string, ordem: "asc" | "desc", limite?: number)
  → retorna array ordenado (com limite opcional)

calcularEstatistica(dados: number[], operacao: "soma" | "media" | "mediana" | "max" | "min")
  → retorna number
```

---

## Estrutura de Arquivos

```text
02-assistente-dados/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   └── perguntar.ts
│   ├── tools/
│   │   ├── definitions.ts
│   │   ├── filtrar.ts
│   │   ├── agrupar.ts
│   │   ├── ordenar.ts
│   │   ├── calcularEstatistica.ts
│   │   └── dispatcher.ts
│   ├── services/
│   │   └── toolLoop.ts
│   ├── dados/
│   │   └── vendas.json         # 100 linhas de vendas fictícias
│   └── types.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Dados

- [ ] Criar `dados/vendas.json` com 100 registros: `{ id, produto, categoria, valor, estado, data }`

### Ferramentas

- [ ] Implementar cada ferramenta com tipagem forte — recebem e retornam tipos definidos
- [ ] `dispatcher.ts`: roteia `toolCall.function.name` para a função correta
- [ ] Ferramentas são puras: dado o mesmo input, retornam o mesmo output

### Servico e Rotas

- [ ] `toolLoop.ts` reutilizado do projeto 01 — passar dataset como contexto global das ferramentas
- [ ] `POST /perguntar`: retorna resposta em linguagem natural
- [ ] `POST /perguntar/debug`: retorna resposta + `[{ tool, input, output }]`

### Validacao

- [ ] "Qual o total de vendas por estado?" — deve encadear `agrupar` + `calcularEstatistica`
- [ ] "Quais os 3 produtos mais vendidos em SP?" — deve encadear `filtrar` + `agrupar` + `ordenar`
- [ ] `POST /perguntar/debug` — verificar que o encadeamento está correto

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# API em http://localhost:3001
```
