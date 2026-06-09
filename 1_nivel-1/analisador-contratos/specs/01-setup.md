# Spec 01 — Setup do Projeto

## Objetivo
Configurar o projeto Node.js/TypeScript com todas as dependências necessárias.

## O que você vai aprender
- Como estruturar um projeto TypeScript do zero
- Por que `strict: true` no tsconfig importa
- A diferença entre dependências de runtime e de desenvolvimento

---

## Estrutura real do projeto

O `package.json` já foi criado dentro de `backend/`. Todos os comandos e arquivos desta spec devem ser executados **dentro dessa pasta**:

```text
analisador-contratos/
├── backend/            ← você trabalha aqui
│   ├── package.json    ← já existe
│   ├── src/
│   ├── public/
│   ├── .env
│   └── tsconfig.json
└── specs/              ← onde estão estas specs
```

```bash
# Entrar na pasta antes de rodar qualquer comando
cd backend
```

---

## Tarefas

### 1. Atualizar package.json

O `package.json` atual está incompleto — só tem `name` e `type`. Substitua o conteúdo por:

```json
{
  "name": "analisador-contratos",
  "version": "1.0.0",
  "description": "Analisador jurídico de contratos com streaming via LLM",
  "type": "commonjs",
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsup src/server.ts --format cjs --dts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

**Por que manter `"type": "commonjs"`?**
O `pdf-parse` tem melhor compatibilidade com CommonJS. O `tsx` cuida de transpilar TypeScript em tempo real durante o desenvolvimento.

**Por que `tsup` no lugar de `tsc`?**
O `tsup` usa o esbuild por baixo — build muito mais rápido que o `tsc`, faz bundle automático e lida bem com CommonJS. O `tsc` continua sendo usado para verificação de tipos (`npx tsc --noEmit`), mas não para gerar o output final.

### 2. Instalar dependências de runtime

```bash
npm install fastify @fastify/cors @fastify/static @fastify/multipart @openrouter/sdk pdf-parse dotenv
```

| Pacote | Para que serve |
|--------|---------------|
| `fastify` | Framework HTTP — nossa alternativa ao Express |
| `@fastify/cors` | Plugin para liberar CORS (browser ↔ servidor) |
| `@fastify/static` | Serve arquivos da pasta `public/` |
| `@fastify/multipart` | Lê upload de arquivos (FormData) |
| `@openrouter/sdk` | SDK oficial do OpenRouter — camada fina sobre a API REST |
| `pdf-parse` | Extrai texto de PDFs em memória, sem salvar em disco |
| `dotenv` | Carrega variáveis do arquivo `.env` |

### 3. Instalar dependências de desenvolvimento

```bash
npm install -D typescript tsx tsup @types/node @types/pdf-parse
```

| Pacote | Para que serve |
|--------|---------------|
| `typescript` | Compilador TypeScript (checagem de tipos) |
| `tsx` | Roda `.ts` diretamente em dev (sem precisar buildar) |
| `tsup` | Bundler para produção, usa esbuild por baixo |
| `@types/node` | Tipos do Node.js para o TypeScript |
| `@types/pdf-parse` | Tipos da lib pdf-parse |

### 4. Criar tsconfig.json

Crie `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

> **Por que `strict: true`?** Ativa verificações extras (null checks, tipos implícitos, etc.). Em projetos com IA integrada, os dados vindos da LLM chegam como `string` bruta — o TypeScript estrito te força a validar antes de usar.

### 5. Criar arquivo .env

Crie `backend/.env` (nunca commite este arquivo):

```env
OPENROUTER_API_KEY=sua_chave_aqui
PORT=3000
SITE_URL=http://localhost:3000
SITE_NAME=Analisador de Contratos
```

Crie também `backend/.env.example` (este você commita):

```env
OPENROUTER_API_KEY=
PORT=3000
SITE_URL=http://localhost:3000
SITE_NAME=Analisador de Contratos
```

Crie `backend/.gitignore`:
```
node_modules/
dist/
.env
```

> **`SITE_URL` e `SITE_NAME`** são os headers `HTTP-Referer` e `X-Title` que o OpenRouter usa para identificar sua aplicação nas análises de uso. Opcionais, mas recomendados pela [documentação oficial](https://openrouter.ai/docs/quickstart#using-the-client-sdks).

### 6. Criar estrutura de pastas

Dentro de `backend/`, crie:

```bash
mkdir -p src/routes src/services public
```

Resultado esperado:

```text
backend/
├── src/
│   ├── routes/
│   └── services/
├── public/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Critério de conclusão

- [ ] `package.json` tem os scripts `dev` e `build`
- [ ] `npm install` executou sem erros (pasta `node_modules/` criada)
- [ ] `tsconfig.json` existe com `strict: true`
- [ ] `backend/.env` existe com `OPENROUTER_API_KEY` preenchida (não commitado)
- [ ] `backend/.env.example` existe (commitado)
- [ ] Pastas `src/routes/`, `src/services/` e `public/` criadas

## Próximo passo

Quando o setup estiver pronto, abra a [Spec 02 — Servidor Fastify](./02-servidor.md).
