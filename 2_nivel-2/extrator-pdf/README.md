# Extrator de Dados de PDFs

Le PDFs e extrai informações estruturadas usando a API do Claude com tool use.

**Stack:** Node.js · TypeScript · Fastify · Claude API (tool use) | **Nivel:** 2 — Intermediario

---

## Descricao

O usuário envia um PDF via API REST (Fastify) e o sistema extrai campos específicos em formato JSON tipado. O schema de extração é definido por tipo de documento e a IA usa tool use (function calling) para garantir structured output. Introduz upload de arquivos com Fastify multipart, tool use da Anthropic SDK e tipagem forte dos resultados.

---

## Regras de Negocio

- O schema de extração é definido em `schemas/<tipo>.json` por tipo de documento.
- Campos marcados como `required: true` devem estar presentes; se ausentes, recebem `null` e emitem aviso.
- PDFs de até 20 páginas são processados direto; documentos maiores são divididos em chunks.
- Cada extração deve ter um score de confiança (0.0–1.0) por campo.
- Suporte mínimo a 3 tipos: `contrato`, `nota-fiscal`, `curriculo`.

---

## Requisitos Funcionais

- [ ] RF01 — `POST /extrair` com multipart: campo `pdf` (arquivo) e campo `tipo`
- [ ] RF02 — Leitura do schema correspondente em `schemas/<tipo>.json`
- [ ] RF03 — Conversão do PDF em imagens para envio à API com visão
- [ ] RF04 — Tool use para forçar o preenchimento exato dos campos do schema
- [ ] RF05 — `GET /extrair/:id` para consultar resultado de uma extração
- [ ] RF06 — Modo lote: `POST /extrair/lote` com array de arquivos
- [ ] RF07 — Retorno JSON com campos extraídos, campos nulos e scores

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — Fastify com `@fastify/multipart` para upload de arquivos
- [ ] RNF03 — `pdf-parse` para extração de texto e `pdf2pic` para imagens
- [ ] RNF04 — Imagens comprimidas para no máximo 1MB antes do envio
- [ ] RNF05 — Schema validado com `zod` antes do processamento

---

## Estrutura de Arquivos

```text
extrator-pdf/
├── src/
│   ├── server.ts             # Fastify + rotas
│   ├── extractor.ts          # Tool use e chamada à API
│   ├── pdfProcessor.ts       # PDF → imagens / texto
│   ├── schemaLoader.ts       # Leitura e validação de schemas
│   └── types.ts              # Interfaces: ExtractionResult, SchemaField, etc.
├── schemas/
│   ├── contrato.json
│   ├── nota-fiscal.json
│   └── curriculo.json
├── exemplos/
│   └── nota_exemplo.pdf
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] Instalar: `npm i fastify @fastify/multipart @anthropic-ai/sdk dotenv pdf-parse pdf2pic zod`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node @types/pdf-parse`

### Schemas

- [ ] Criar `schemas/contrato.json`: partes, objeto, valor, data_inicio, data_fim
- [ ] Criar `schemas/nota-fiscal.json`: numero, emitente, destinatario, itens, total, data_emissao
- [ ] Criar `schemas/curriculo.json`: nome, email, telefone, formacao, experiencias, habilidades

### Core

- [ ] Implementar `pdfProcessor.ts` com `pdfToImages(path)` e `pdfToText(path)`
- [ ] Implementar `schemaLoader.ts` com `loadSchema(tipo)` e validação Zod
- [ ] Implementar `extractor.ts` com `buildToolDefinition(schema)` e chamada à API
- [ ] Implementar divisão em chunks para PDFs > 20 páginas
- [ ] Implementar compressão de imagens antes do envio

### API

- [ ] Rotas `POST /extrair`, `GET /extrair/:id` e `POST /extrair/lote`
- [ ] Upload via `@fastify/multipart` com salvamento temporário
- [ ] Resposta JSON com campos, scores e avisos de campos nulos

### Validacao

- [ ] Extrair `exemplos/nota_exemplo.pdf` e verificar campos
- [ ] Forçar campo obrigatório ausente e verificar aviso no retorno
- [ ] Verificar que nenhuma imagem enviada excede 1MB

---

## Exemplo de Schema

```json
{
  "tipo": "nota-fiscal",
  "campos": [
    { "nome": "numero",       "tipo": "string",  "required": true  },
    { "nome": "total",        "tipo": "number",  "required": true  },
    { "nome": "data_emissao", "tipo": "string",  "required": true  },
    { "nome": "cnpj_emitente","tipo": "string",  "required": false }
  ]
}
```

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev
# POST http://localhost:3000/extrair
```
