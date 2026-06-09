# Spec 03 — Tipos e Prompts

## Objetivo
Definir os tipos TypeScript do domínio e criar os templates de prompt para cada modo de análise.

## O que você vai aprender
- Como modelar domínios com TypeScript (`type`, `interface`)
- O que é prompt engineering e por que o prompt importa tanto quanto o código
- Como estruturar prompts para resultados consistentes com LLMs

---

## Contexto: Por que prompts são críticos

Quando você integra uma LLM na sua aplicação, o prompt é a "interface" entre o seu sistema e o modelo. Um prompt mal escrito gera respostas inconsistentes, sem estrutura, ou fora do escopo desejado.

Para este projeto, temos 3 modos de análise diferentes. Cada um precisa de um prompt que:
1. Define o **papel** do modelo ("você é um analista jurídico")
2. Especifica o **formato** da resposta
3. Restringe o modelo ao **texto fornecido** (sem inventar)

---

## Tarefas

### 1. Criar `src/types.ts`

```typescript
// src/types.ts

export type ModoAnalise = "riscos" | "obrigacoes" | "resumo";

export interface AnaliseRequest {
  modo: ModoAnalise;
  texto: string;
}
```

> **Por que `type` e não `interface` para ModoAnalise?**  
> `type` é melhor para union types (um conjunto fixo de strings). `interface` é melhor para objetos com propriedades. Essa distinção vai aparecer muito quando você integrar LLMs — os parâmetros das APIs externas geralmente são definidos com `type`.

### 2. Criar `src/prompts.ts`

```typescript
// src/prompts.ts
import { ModoAnalise } from "./types";

const SISTEMA = `Você é um analista jurídico especializado em revisão de contratos.
Sua análise deve se basear EXCLUSIVAMENTE no texto fornecido, sem usar conhecimento externo.
Comece sempre identificando o tipo de contrato (ex: "Tipo identificado: Contrato de Prestação de Serviços").`;

const INSTRUCOES: Record<ModoAnalise, string> = {
  riscos:
    "Liste os principais pontos de risco para as partes envolvidas. " +
    "Identifique cláusulas abusivas, prazos problemáticos ou obrigações desproporcionais. " +
    "Use marcadores e seja objetivo.",

  obrigacoes:
    "Liste as obrigações de cada parte de forma clara e separada. " +
    "Use o formato:\n**Parte A deve:**\n- item\n\n**Parte B deve:**\n- item",

  resumo:
    "Faça um resumo executivo em até 3 parágrafos: " +
    "1) tipo e objetivo do contrato, 2) principais condições, 3) pontos de atenção. " +
    "Use linguagem acessível, sem jargões jurídicos.",
};

export function getPrompt(texto: string, modo: ModoAnalise): string {
  return `${SISTEMA}\n\n${INSTRUCOES[modo]}\n\n---\n\nCONTRATO:\n${texto}`;
}

export function getMensagemSistema(): string {
  return SISTEMA;
}
```

> **Dica de prompt engineering:** Separar a mensagem de sistema (`SISTEMA`) da instrução específica (`INSTRUCOES`) facilita ajustes. Se você quiser mudar o tom de todos os modos, altera só o `SISTEMA`. Se quiser ajustar como os riscos são listados, altera só `riscos`.

### 3. Entender a estrutura do prompt

O prompt final enviado à LLM será:

```
Você é um analista jurídico...
[instrução do modo]
---
CONTRATO:
[texto do contrato]
```

Essa estrutura é intencional:
- O `---` separa claramente instrução do conteúdo
- `CONTRATO:` como label ajuda o modelo a entender o que é instrução e o que é dado

---

## Critério de conclusão

- [ ] `src/types.ts` criado com `ModoAnalise` e `AnaliseRequest`
- [ ] `src/prompts.ts` criado com `getPrompt()` exportada
- [ ] TypeScript compila sem erros (`npx tsc --noEmit`)

## Próximo passo

Com os tipos definidos, vá para a [Spec 04 — Serviços: PDF e LLM](./04-services.md).
