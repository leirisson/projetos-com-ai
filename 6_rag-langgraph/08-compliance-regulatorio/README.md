# 08 — Monitor de Compliance Regulatorio

RAG incremental com ingestão automática de novos documentos regulatórios.

**Stack:** Node.js · TypeScript · Fastify · Next.js · PostgreSQL (pgvector) · LangGraph.js · Claude API
**Topico RAG:** RAG incremental — novos documentos indexados sem reprocessar os existentes
**Topico LangGraph:** Pipeline de ingestão agendada com nós de validação e deduplicação

---

## Descricao

Empresas precisam acompanhar normas regulatórias (LGPD, resoluções do Banco Central, normas da ANATEL, etc.) que são atualizadas frequentemente. O sistema monitora uma pasta de entrada, indexa novos documentos automaticamente e permite consultas sobre quais normas se aplicam a um determinado cenário. O grafo LangGraph orquestra o pipeline de ingestão com validação, deduplicação e notificação de novos documentos.

---

## Regras de Negocio

- Novos arquivos na pasta `documentos/entrada/` são detectados e indexados automaticamente.
- Cada documento tem versão e data de vigência — versões antigas são arquivadas, não deletadas.
- Deduplicação por hash E por similaridade semântica (evita variações do mesmo documento).
- Ao indexar um novo documento, o sistema verifica se ele contradiz ou substitui um existente.
- Respostas devem indicar norma, artigo/seção e data de vigência.

---

## Requisitos Funcionais

- [ ] RF01 — Watcher em `documentos/entrada/` que dispara a ingestão ao detectar arquivo novo
- [ ] RF02 — `GET /documentos` com filtros: `tipo`, `orgao`, `data_vigencia`, `ativo`
- [ ] RF03 — `POST /perguntar` — responde qual norma se aplica a um cenário descrito
- [ ] RF04 — `GET /alertas` — lista documentos novos das últimas 24h
- [ ] RF05 — Frontend: dashboard de normas ativas, alertas de novidades e chat

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Watcher com `chokidar` para monitorar a pasta de entrada
- [ ] RNF02 — Tabela `documentos` com `versao`, `data_vigencia`, `ativo`, `substituido_por`
- [ ] RNF03 — Deduplicação em duas etapas: hash SHA-256 + similaridade coseno > 0.95
- [ ] RNF04 — Ingestão assíncrona (não bloqueia a API)

---

## Grafo LangGraph (Ingestao)

```text
[START: novo arquivo detectado]
  ↓
[validarArquivo]           → extensão suportada? tamanho OK?
  ↓ inválido               ↓ válido
[moverParaRejeitados]  [verificarDuplicata]
                           ↓ duplicata          ↓ novo
                       [arquivar]         [extrairMetadados]  → Claude extrai: orgao, tipo, data_vigencia
                                               ↓
                                          [verificarConflito]  → documento substitui algum existente?
                                               ↓ sim           ↓ não
                                          [arquivarAntigo]  [indexar]
                                                ↓              ↓
                                           [indexar]      [notificar]
                                               ↓
                                           [END]
```

---

## Tarefas

### Watcher

- [ ] Implementar watcher com `chokidar` que chama o grafo ao detectar arquivo
- [ ] Pasta `documentos/entrada/`, `documentos/processados/`, `documentos/rejeitados/`

### Metadados

- [ ] Nó `extrairMetadados`: prompt ao Claude para extrair orgao, tipo, data_vigencia, numero
- [ ] Nó `verificarConflito`: busca vetorial para encontrar documentos similares (score > 0.85)

### Banco

- [ ] Tabela `documentos` com campos de versionamento
- [ ] Procedure para arquivar documento antigo e criar link `substituido_por`

### API e Frontend

- [ ] Dashboard com normas ativas por órgão
- [ ] Badge de "Novo" para documentos das últimas 24h
- [ ] Chat com resposta citando artigo e data de vigência

### Validacao

- [ ] Dropar arquivo na pasta de entrada e verificar indexação automática
- [ ] Dropar versão atualizada do mesmo documento e verificar arquivamento do antigo
- [ ] Dropar arquivo corrompido e verificar rejeição

---

## Como executar

```bash
docker compose up -d && npm install
npm run dev -w apps/api && npm run dev -w apps/web
# Coloque PDFs em documentos/entrada/ para testar a ingestão automática
```
