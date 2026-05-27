# 05 — Suporte com Feedback Loop

RAG com ciclo de feedback do usuário que melhora o reranking ao longo do tempo.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** Feedback loop — thumbs up/down atualiza scores de relevância dos chunks
**Topico LangGraph:** Ciclo de refinamento — usuário pode pedir nova tentativa

---

## Descricao

Sistema de suporte técnico onde os usuários avaliam as respostas (positivo/negativo). Cada avaliação negativa registra quais chunks foram usados e decrementa seu score de relevância. Com o tempo, chunks frequentemente avaliados negativamente têm menor probabilidade de ser recuperados. O grafo permite que o usuário peça uma nova tentativa, que busca chunks diferentes excluindo os já usados.

---

## Regras de Negocio

- Cada chunk tem um campo `relevancia_score` (padrão 1.0) que é ajustado pelo feedback.
- Avaliação positiva: `relevancia_score += 0.1` (teto 2.0).
- Avaliação negativa: `relevancia_score -= 0.2` (piso 0.1).
- O score de relevância é multiplicado pelo score de similaridade na busca.
- "Nova tentativa" exclui os chunk IDs já usados na resposta anterior.
- Máximo de 3 tentativas por pergunta.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /perguntar` — responde e retorna `{ respostaId, chunkIds[] }`
- [ ] RF02 — `POST /respostas/:id/feedback` — `{ avaliacao: "positivo" | "negativo" }`
- [ ] RF03 — `POST /respostas/:id/nova-tentativa` — busca com exclusão dos chunks anteriores
- [ ] RF04 — `GET /chunks/:id/historico` — histórico de feedback de um chunk
- [ ] RF05 — Frontend: chat com botões de thumbs up/down e botão "tentar novamente"

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Tabela `feedbacks` com `chunk_id`, `avaliacao`, `pergunta`, `timestamp`
- [ ] RNF02 — Query de busca: `ORDER BY (embedding <=> $query) * relevancia_score`
- [ ] RNF03 — Nó de nova tentativa passa `excludeChunkIds` para o nó de busca
- [ ] RNF04 — Relatório de admin: top 10 chunks menos úteis

---

## Grafo LangGraph

```text
[START]
  ↓
[buscarChunks]         → busca com score ponderado por relevancia_score
  ↓
[gerarResposta]        → gera resposta, armazena chunkIds usados
  ↓
[aguardarFeedback]     → estado persistido (aguarda ação do usuário)
  ↓ "nova tentativa"   ↓ "positivo/negativo"
[buscarChunks]    [registrarFeedback]
(com exclusões)        ↓
                     [END]
```

---

## Tarefas

### Banco

- [ ] Adicionar `relevancia_score FLOAT DEFAULT 1.0` na tabela `chunks`
- [ ] Criar tabela `feedbacks`
- [ ] Criar tabela `respostas` com `chunk_ids UUID[]`

### Feedback

- [ ] Implementar `feedbackService.ts` com `registrar(respostaId, avaliacao)` que atualiza scores
- [ ] Implementar limites (teto 2.0, piso 0.1)

### Grafo

- [ ] Estado com `chunkIds`, `tentativas`, `excluirChunkIds`
- [ ] Modificar query de busca para ponderar por `relevancia_score`
- [ ] Nó de nova tentativa incrementa `tentativas` e passa exclusões
- [ ] Bloquear após 3 tentativas

### Frontend

- [ ] Botões thumbs up/down após cada resposta
- [ ] Botão "Tentar novamente" (visível até 3 vezes)
- [ ] Feedback visual: "Obrigado! Vou usar isso para melhorar."

### Validacao

- [ ] Avaliar negativamente 5 vezes o mesmo chunk e verificar que deixa de aparecer
- [ ] Testar nova tentativa e verificar que retorna chunks diferentes
- [ ] Verificar que o `relevancia_score` é persistido entre sessões

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
