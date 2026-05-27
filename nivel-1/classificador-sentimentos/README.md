# Classificador de Sentimentos

Analisa textos e classifica o sentimento como positivo, negativo ou neutro usando a API do Claude.

**Stack:** Node.js · TypeScript · OpenRouter SDK | **Nivel:** 1 — Iniciante

---

## Descricao

O usuário fornece um arquivo CSV com textos (avaliações, comentários, tweets) e o sistema retorna a classificação de sentimento junto com um score de confiança. O foco é em structured output — fazer a IA retornar JSON tipado e previsível usando TypeScript.

---

## Regras de Negocio

- A classificação deve ser uma das três categorias fixas: `positivo`, `negativo` ou `neutro`.
- Cada resultado deve incluir um score de confiança de 0.0 a 1.0.
- O sistema deve processar múltiplos textos em lote a partir de um arquivo CSV.
- Textos em branco ou com menos de 5 caracteres devem ser ignorados com log de aviso.
- O resultado deve ser exportado em um novo CSV com as colunas originais + sentimento + score.

---

## Requisitos Funcionais

- [ ] RF01 — Aceitar arquivo CSV de entrada via argumento de linha de comando
- [ ] RF02 — Identificar automaticamente qual coluna contém o texto a analisar
- [ ] RF03 — Para cada linha, chamar a API e obter classificação + score + justificativa
- [ ] RF04 — Salvar resultados em `resultado.csv`
- [ ] RF05 — Exibir progresso no terminal durante o processamento
- [ ] RF06 — Gerar resumo ao final (total por categoria, média de score)

---

## Requisitos Nao Funcionais

- [ ] RNF01 — Projeto 100% TypeScript com `strict: true`
- [ ] RNF02 — O prompt deve instruir a IA a retornar JSON válido (structured output)
- [ ] RNF03 — Delay mínimo de 500ms entre requests para evitar rate limit
- [ ] RNF04 — Retry automático (máx 3 tentativas) em caso de erro de API
- [ ] RNF05 — Chave de API via variável de ambiente

---

## Estrutura de Arquivos

```text
classificador-sentimentos/
├── src/
│   ├── index.ts         # Ponto de entrada e processamento do CSV
│   ├── classifier.ts    # Chamada à API e parsing do JSON
│   └── types.ts         # Interfaces: ClassificationResult, SentimentType
├── exemplo.csv          # CSV de exemplo com textos para teste
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## Tarefas

### Setup

- [ ] `npm init -y` e configurar `tsconfig.json` com `strict: true`
- [ ] Instalar: `npm i @anthropic-ai/sdk dotenv csv-parse csv-stringify`
- [ ] Instalar dev: `npm i -D typescript tsx @types/node`

### Tipos

- [ ] Criar `types.ts` com `SentimentType`, `ClassificationResult` e `CsvRow`

### Implementacao

- [ ] Criar `exemplo.csv` com 20 linhas de avaliações fictícias
- [ ] Implementar `classifier.ts` com `classify(text: string): Promise<ClassificationResult>`
- [ ] Montar prompt que exige resposta no formato `{"sentimento": "...", "score": 0.0, "justificativa": "..."}`
- [ ] Implementar parsing do JSON com fallback para erro de parse
- [ ] Implementar retry com loop manual (máx 3 tentativas) e delay de 500ms
- [ ] Implementar `index.ts` com leitura do CSV, loop de processamento e exportação
- [ ] Imprimir barra de progresso simples (ex: `[10/20] processando...`)
- [ ] Imprimir resumo final no terminal

### Validacao

- [ ] Processar `exemplo.csv` e verificar `resultado.csv`
- [ ] Testar com texto em branco e com menos de 5 caracteres
- [ ] Verificar que o JSON retornado é sempre válido e tipado corretamente

---

## Formato de Saida Esperado

```text
Processando 20 textos...
[20/20] concluído

Resumo:
  Positivo: 12 (60%)  | Score médio: 0.87
  Negativo:  5 (25%)  | Score médio: 0.91
  Neutro:    3 (15%)  | Score médio: 0.72

Resultado salvo em: resultado.csv
```

---

## Como executar

```bash
cp .env.example .env
npm install
npm run dev -- --arquivo exemplo.csv --coluna texto
```
