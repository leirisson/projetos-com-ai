# 10 — Multi-Agente

Orquestração de múltiplos agentes especializados coordenados por um agente supervisor.

**Stack:** Node.js · TypeScript · Fastify · Next.js · LangGraph.js · Claude API
**Conceito:** Supervisor pattern, agentes como nós, handoff entre agentes, estado compartilhado

---

## Descricao

Sistema de criação de campanha de marketing com 4 agentes especializados coordenados por um
supervisor: `agenteTexto` (redação), `agenteImagem` (prompts para geração de imagem),
`agenteSEO` (otimização) e `agenteRevisao` (revisão final). O supervisor analisa o pedido,
decide qual agente acionar, passa o resultado adiante e coordena o fluxo completo.
Demonstra o padrão mais avançado do LangGraph: múltiplos agentes com especialidades distintas.

---

## Conceitos Ensinados

- Supervisor pattern: agente que roteia trabalho para sub-agentes
- Cada sub-agente é um subgrafo compilado com suas próprias ferramentas
- Handoff: como um agente passa o resultado para o próximo
- Estado compartilhado vs estado privado de cada agente
- Como evitar conflitos quando múltiplos agentes escrevem no mesmo estado

---

## Estrutura do Grafo

```text
[START]
  ↓
[supervisor]           → decide qual agente acionar
  ↓ condicional
  ├── "texto"    → [agenteTexto]    → [supervisor]  ← volta para coordenar
  ├── "imagem"   → [agenteImagem]   → [supervisor]
  ├── "seo"      → [agenteSEO]      → [supervisor]
  ├── "revisao"  → [agenteRevisao]  → [supervisor]
  └── "concluir" → [END]
```

---

## Estado

```typescript
const Estado = Annotation.Root({
  pedido:         Annotation<string>(),
  mensagens:      Annotation<Message[]>({ reducer: acumular }),
  textoGerado:    Annotation<string>(),
  promptsImagem:  Annotation<string[]>({ reducer: acumular }),
  textoSEO:       Annotation<string>(),
  revisaoFinal:   Annotation<string>(),
  proximoAgente:  Annotation<string>(),  // supervisor escreve aqui
});
```

---

## Tarefas

### Sub-Agentes

- [ ] `agenteTexto`: recebe briefing, gera texto criativo, retorna para supervisor
- [ ] `agenteImagem`: recebe texto, gera 3 prompts de imagem descritivos
- [ ] `agenteSEO`: recebe texto, sugere título, meta description e keywords
- [ ] `agenteRevisao`: recebe todos os outputs, faz revisão integrada final

### Supervisor

- [ ] Prompt do supervisor com lista dos agentes disponíveis e quando usar cada um
- [ ] Supervisor retorna `{ proximoAgente: "texto" | "imagem" | "seo" | "revisao" | "concluir" }`
- [ ] Aresta condicional mapeia `proximoAgente` → nó correspondente

### Frontend

- [ ] Timeline mostrando qual agente trabalhou em cada etapa
- [ ] Output de cada agente exibido em card separado
- [ ] Resultado final consolidado ao término

### Validacao

- [ ] Pedido: "Campanha para lançamento de app de meditação" — verificar que todos os 4 agentes são acionados
- [ ] Verificar que o supervisor não aciona o mesmo agente duas vezes desnecessariamente
- [ ] Verificar isolamento: `agenteTexto` não modifica `promptsImagem` e vice-versa

---

## Como executar

```bash
npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
