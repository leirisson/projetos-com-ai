# Spec 02 — Servidor Fastify

## Objetivo
Criar o servidor HTTP com Fastify, registrar plugins e criar a rota de healthcheck.

## O que você vai aprender
- Como o Fastify se organiza (plugins, rotas, instância)
- Por que registrar plugins antes de usar
- Como servir arquivos estáticos

---

## Contexto: Fastify vs Express

O Fastify é mais rápido e tem TypeScript nativo melhor que o Express. A estrutura é parecida, mas com uma diferença importante: **plugins precisam ser registrados antes de usar**. Isso é feito com `fastify.register()`.

---

## Tarefas

### 1. Criar `src/server.ts`

Este arquivo é o ponto de entrada. Ele:
1. Cria a instância do Fastify
2. Registra os plugins
3. Registra as rotas
4. Inicia o servidor

```typescript
// src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import staticFiles from "@fastify/static";
import multipart from "@fastify/multipart";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({ logger: true });

// Plugins
fastify.register(cors);
fastify.register(staticFiles, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/",
});
fastify.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Rotas
fastify.get("/health", async () => {
  return { status: "ok" };
});

// Iniciar
const PORT = Number(process.env.PORT) || 3000;

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
```

> **Por que `__dirname`?** No módulo CommonJS, `__dirname` aponta para o diretório do arquivo compilado. Usamos `path.join(__dirname, "..", "public")` para subir um nível e chegar na pasta `public/`.

### 2. Criar `public/index.html` temporário

Para testar que os arquivos estáticos estão funcionando:

```html
<!DOCTYPE html>
<html>
  <head><title>Analisador de Contratos</title></head>
  <body>
    <h1>Em construção</h1>
  </body>
</html>
```

### 3. Testar

```bash
npm run dev
```

Acesse:
- `http://localhost:3000/health` → deve retornar `{"status":"ok"}`
- `http://localhost:3000/` → deve exibir a página HTML

---

## Critério de conclusão

- [ ] `GET /health` retorna `{ status: "ok" }`
- [ ] `GET /` serve o `public/index.html`
- [ ] Servidor inicia sem erros no terminal

## Próximo passo

Com o servidor rodando, vá para a [Spec 03 — Tipos e Prompts](./03-tipos-prompts.md).
