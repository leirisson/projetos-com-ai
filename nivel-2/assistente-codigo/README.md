# Assistente de Codigo

Ferramenta CLI que revisa, explica e sugere melhorias em trechos de código usando a API do Claude.

**Stack:** Node.js · TypeScript · Claude API | **Nivel:** 2 — Intermediario

---

## Descricao

O desenvolvedor passa um arquivo de código pela CLI e escolhe uma ação: `revisar` (aponta problemas), `explicar` (descreve o que o código faz) ou `melhorar` (sugere refatorações com código reescrito). A ferramenta detecta a linguagem automaticamente e usa streaming para exibir a resposta em tempo real. Introduz CLI profissional com TypeScript, `commander` e `chalk`.

---

## Regras de Negocio

- A linguagem é detectada pela extensão do arquivo.
- No modo `melhorar`, a resposta deve conter o código reescrito em bloco separado.
- No modo `revisar`, os problemas devem ser listados por severidade: `[CRITICO]`, `[AVISO]`, `[SUGESTAO]`.
- Arquivos maiores que 500 linhas devem ser truncados com aviso, ou o usuário pode especificar um range.
- O histórico de revisões deve ser salvo em `.historico/` para consulta posterior.

---

## Requisitos Funcionais

- [ ] RF01 — CLI: `npx tsx src/index.ts <arquivo> --acao <revisar|explicar|melhorar>`
- [ ] RF02 — Opção `--linhas 10-50` para analisar apenas um trecho do arquivo
- [ ] RF03 — Detecção automática da linguagem pelo sufixo do arquivo
- [ ] RF04 — Modo `revisar`: lista de problemas por severidade
- [ ] RF05 — Modo `explicar`: descrição em linguagem natural
- [ ] RF06 — Modo `melhorar`: código reescrito + explicação das mudanças
- [ ] RF07 — Salvar resultado em `.historico/<timestamp>_<arquivo>_<acao>.md`
- [ ] RF08 — Flag `--historico` para listar revisões anteriores

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — Suporte às linguagens: TypeScript, JavaScript, Go, Ruby, Java, Python
- [ ] RNF03 — Output colorido no terminal com `chalk`
- [ ] RNF04 — Streaming da API para exibir resposta em tempo real
- [ ] RNF05 — Timeout de 60s por request
- [ ] RNF06 — Prompt inclui metadados do arquivo: linguagem, nº de linhas, nome

---

## Estrutura de Arquivos

```text
assistente-codigo/
├── src/
│   ├── index.ts          # CLI com commander
│   ├── analyzer.ts       # Chamada à API com streaming
│   ├── prompts.ts        # Templates de prompt por ação
│   ├── languages.ts      # Map extensão -> linguagem
│   ├── history.ts        # Leitura e escrita do histórico
│   └── types.ts          # Interfaces: Acao, Linguagem, HistoricoEntry
├── exemplos/
│   ├── exemplo.ts
│   ├── exemplo.js
│   └── exemplo.go
├── .historico/           # Criado em runtime (gitignored)
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i @anthropic-ai/sdk dotenv commander chalk`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`

### Core

- [ ] Implementar `languages.ts` com `Record<string, string>` de extensões
- [ ] Implementar `prompts.ts` com um prompt especializado para cada ação
- [ ] Implementar `analyzer.ts` com `analyze(code: string, language: string, acao: Acao)`
- [ ] Implementar leitura de arquivo com suporte ao range `--linhas`
- [ ] Implementar truncamento com aviso para arquivos > 500 linhas

### CLI

- [ ] Configurar `commander` com todos os argumentos e flags
- [ ] Implementar output colorido com `chalk` por severidade no modo `revisar`
- [ ] Exibir bloco de código com destaque no modo `melhorar`

### Historico

- [ ] Implementar `history.ts` com `save(content, arquivo, acao)` e `listHistory()`
- [ ] Criar `.historico/` automaticamente se não existir
- [ ] Listar entradas com `--historico`

### Validacao

- [ ] Testar `revisar` em `exemplos/exemplo.ts` com bugs intencionais
- [ ] Testar `explicar` em `exemplos/exemplo.go`
- [ ] Testar `melhorar` com `--linhas 1-30`
- [ ] Verificar salvamento correto no histórico

---

## Exemplos de Uso

```bash
# Revisar arquivo completo
npx tsx src/index.ts exemplos/exemplo.ts --acao revisar

# Explicar trecho específico
npx tsx src/index.ts exemplos/exemplo.go --acao explicar --linhas 15-60

# Melhorar
npx tsx src/index.ts exemplos/exemplo.js --acao melhorar

# Listar histórico
npx tsx src/index.ts --historico
```
