# 07 — Human in the Loop

Pausar a execução do grafo para aguardar aprovação humana antes de continuar.

**Stack:** Node.js · TypeScript · Fastify · Next.js · LangGraph.js · PostgreSQL · Claude API
**Conceito:** interrupt(), NodeInterrupt, updateState, retomada após aprovação

---

## Descricao

Pipeline de publicação de conteúdo onde um humano precisa aprovar o artigo antes do envio.
O grafo executa até o nó de revisão humana, pausa e persiste o estado. O revisor acessa o
frontend, lê o artigo, aprova ou rejeita com comentários. O grafo retoma do ponto onde parou.
Demonstra o padrão essencial para qualquer sistema onde a IA não pode agir sem supervisão.

---

## Conceitos Ensinados

- `interrupt(valor)` para pausar a execução e expor dados ao humano
- Estado com `status: "aguardando_revisao" | "aprovado" | "rejeitado"`
- `grafo.updateState(config, { decisao, comentario })` para injetar a decisão
- `grafo.invoke(null, config)` para retomar a execução do ponto de pausa
- Checkpointing é obrigatório para human-in-the-loop

---

## Estrutura do Grafo

```text
[START]
  ↓
[gerarArtigo]
  ↓
[revisaoHumana]         ← interrupt() aqui — grafo pausa e retorna ao chamador
  ↓ (após updateState com decisao)
  ├── "aprovado"   → [publicar]  → [END]
  └── "rejeitado"  → [reescrever com comentario] → [gerarArtigo]  ← ciclo
```

---

## Tarefas

### Backend

- [ ] PostgresSaver como checkpointer (obrigatório)
- [ ] Nó `revisaoHumana` com `throw new NodeInterrupt({ artigo: estado.artigo })`
- [ ] Rota `POST /artigos/:id/decisao` que chama `updateState` + `invoke(null, config)`
- [ ] Rota `GET /artigos/pendentes` lista artigos aguardando revisão

### Frontend

- [ ] Página de revisão: exibe o artigo completo com opções "Aprovar" / "Rejeitar + comentário"
- [ ] Dashboard de artigos pendentes com tempo em fila
- [ ] Feedback visual: "Artigo aprovado e publicado" ou "Enviado para reescrita"

### Validacao

- [ ] Gerar artigo, verificar que grafo pausa e estado fica `aguardando_revisao`
- [ ] Aprovar pelo frontend e verificar que grafo retoma e publica
- [ ] Rejeitar com comentário e verificar que o agente reescreve incorporando o feedback
- [ ] Encerrar processo e reiniciar — artigo ainda deve estar pendente (checkpoint)

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
```
