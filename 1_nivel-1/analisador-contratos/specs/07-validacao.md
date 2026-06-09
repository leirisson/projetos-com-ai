# Spec 07 — Validação e Testes

## Objetivo
Validar que todos os requisitos funcionais e regras de negócio estão funcionando corretamente antes de considerar o projeto concluído.

## O que você vai aprender
- Como testar APIs com upload de arquivo via curl
- Como identificar e tratar edge cases em aplicações com LLM
- O que observar no streaming para garantir qualidade

---

## Checklist de Validação

### Backend — Rotas

Execute cada teste e marque como passou ou falhou.

#### Healthcheck
```bash
curl http://localhost:3000/health
# Esperado: {"status":"ok"}
```

#### Texto muito curto (< 300 chars)
```bash
curl -X POST http://localhost:3000/analisar \
  -F "modo=resumo" \
  -F "texto=contrato curto"
# Esperado: status 400, {"error":"O texto deve ter no mínimo 300 caracteres."}
```

#### Modo inválido
```bash
curl -X POST http://localhost:3000/analisar \
  -F "modo=invalido" \
  -F "texto=$(python3 -c "print('x'*400)")"
# Esperado: status 400, {"error":"Modo inválido: invalido"}
```

#### Texto válido com modo resumo
```bash
# Crie um arquivo texto com 300+ chars e teste:
curl -X POST http://localhost:3000/analisar \
  -F "modo=resumo" \
  -F "texto=CONTRATO DE PRESTAÇÃO DE SERVIÇOS. As partes, doravante denominadas Contratante e Contratada, acordam os seguintes termos: A Contratada prestará serviços de consultoria pelo prazo de 12 meses. O pagamento será de R$5.000 mensais, devidos até o dia 10 de cada mês. A rescisão antecipada pela Contratante implicará multa de 3 meses. Foro: São Paulo."
# Esperado: stream SSE com tokens chegando progressivamente
```

#### PDF válido
```bash
curl -X POST http://localhost:3000/analisar \
  -F "modo=riscos" \
  -F "arquivo=@/caminho/para/contrato.pdf"
# Esperado: stream SSE com análise de riscos
```

#### PDF acima de 10 MB
```bash
# Gere um PDF grande (ou use um arquivo qualquer acima de 10MB):
curl -X POST http://localhost:3000/analisar \
  -F "modo=resumo" \
  -F "arquivo=@/caminho/para/arquivo-grande.pdf"
# Esperado: status 400, {"error":"PDF maior que 10 MB."}
```

---

### Frontend — Interface

Abra `http://localhost:3000` e teste manualmente:

- [ ] **Contador de chars:** Digite no textarea. O contador deve atualizar em tempo real e ficar vermelho abaixo de 300 ou acima de 80.000.
- [ ] **Upload PDF:** Selecione um PDF. O nome deve aparecer e o textarea deve ficar desabilitado.
- [ ] **Limpar PDF:** Remova o arquivo selecionado. O textarea deve voltar ao normal.
- [ ] **Streaming:** Envie um contrato válido. O texto deve aparecer progressivamente (não de uma vez).
- [ ] **Botão desabilitado:** Durante o processamento, o botão deve estar desabilitado.
- [ ] **Copiar:** Clique em "Copiar" após análise. Cole em outro lugar e confirme.
- [ ] **Erro de validação:** Envie texto com menos de 300 chars pelo botão. Mensagem de erro deve aparecer.

---

### Regras de Negócio

- [ ] **PDF tem prioridade:** Envie texto no textarea E selecione um PDF. O resultado deve ser baseado no PDF.
- [ ] **Tipo de contrato identificado:** Toda resposta deve começar identificando o tipo de contrato.
- [ ] **Sem inferências externas:** A análise deve mencionar apenas informações presentes no texto fornecido.
- [ ] **3 modos distintos:** As respostas de `riscos`, `obrigacoes` e `resumo` devem ter formatos claramente diferentes.

---

### Edge Cases com LLM

Estes são específicos de aplicações com IA:

- [ ] **PDF escaneado (imagem):** Envie um PDF sem texto selecionável. Deve retornar mensagem: "O PDF não contém texto extraível."
- [ ] **Contrato em inglês:** O modelo deve analisar em português mesmo assim (o prompt instrui em PT-BR).
- [ ] **Contrato muito fragmentado:** Texto com muitas abreviações e formatação quebrada. O modelo deve fazer o melhor possível.

---

## Problemas Comuns e Soluções

| Problema | Causa Provável | Solução |
|---------|----------------|---------|
| `OPENROUTER_API_KEY` undefined | `.env` não carregado | Verificar se `dotenv.config()` está no topo do `server.ts` |
| Stream para após 1 token | Erro silencioso no generator | Adicionar `try/catch` dentro do `for await` do `streamAnalise` |
| PDF não lê texto | `pdf-parse` com versão incompatível | Testar com `pdf-parse@1.1.1` especificamente |
| CORS bloqueado | Plugin não registrado antes das rotas | Garantir que `fastify.register(cors)` vem antes das rotas |
| Arquivo estático não serve | Path errado no `@fastify/static` | Verificar se `path.join(__dirname, "..", "public")` está correto |

---

## Conclusão do Projeto

Quando todos os itens estiverem marcados:

1. Atualize o `README.md` com instruções de como executar
2. Commit com a mensagem: `feat: analisador de contratos com streaming e PDF`
3. Documente no `CLAUDE.md` do projeto qualquer obstáculo encontrado

**Parabéns! Você implementou:**
- Integração real com LLM via streaming
- Upload e processamento de PDF em memória
- Server-Sent Events do zero
- Prompt engineering com variação de modo
- Controle de sessões simultâneas
