# Spec 06 — Frontend

## Objetivo
Criar a interface web: formulário de input, exibição do streaming SSE e funcionalidades auxiliares (contador de chars, copiar, etc.).

## O que você vai aprender
- Como consumir SSE com `fetch` + `ReadableStream` (mais moderno que `EventSource`)
- Como enviar arquivos com `FormData`
- Como dar feedback visual durante operações assíncronas

---

## Contexto: fetch + ReadableStream vs EventSource

Poderíamos usar `EventSource` do browser para SSE, mas ele não suporta `POST`. Como nosso endpoint é `POST /analisar`, usamos `fetch` com leitura manual do `ReadableStream` — mais trabalhoso, mas funciona com qualquer método HTTP.

---

## Tarefas

### 1. Criar `public/style.css`

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
}

h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 1rem; }
label { display: block; font-weight: 600; margin-bottom: .4rem; font-size: .9rem; }

textarea {
  width: 100%;
  height: 180px;
  padding: .75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: .9rem;
  resize: vertical;
}

.char-count { font-size: .8rem; color: #666; text-align: right; margin-top: .2rem; }
.char-count.alerta { color: #e53e3e; font-weight: 600; }

select, input[type="file"] {
  width: 100%;
  padding: .6rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.file-name {
  font-size: .8rem;
  color: #555;
  margin-top: .3rem;
  min-height: 1.2rem;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: .75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: .5rem;
}

button:disabled { background: #93c5fd; cursor: not-allowed; }

.resultado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 .5rem;
}

.resultado-header h2 { font-size: 1rem; }

#btnCopiar {
  width: auto;
  padding: .4rem .8rem;
  font-size: .85rem;
  background: #f3f4f6;
  color: #333;
  border: 1px solid #ddd;
  margin-top: 0;
}

#resultado {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  min-height: 120px;
  white-space: pre-wrap;
  font-size: .9rem;
  line-height: 1.6;
}

.erro { color: #e53e3e; font-weight: 600; }
```

### 2. Criar `public/index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Analisador de Contratos</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div class="container">
    <h1>Analisador de Contratos</h1>

    <div class="form-group">
      <label for="texto">Texto do contrato</label>
      <textarea id="texto" placeholder="Cole aqui o texto do contrato..."></textarea>
      <div class="char-count" id="charCount">0 / 80.000 caracteres (mínimo: 300)</div>
    </div>

    <div class="form-group">
      <label for="arquivo">Ou faça upload de um PDF (máx. 10 MB)</label>
      <input type="file" id="arquivo" accept=".pdf" />
      <div class="file-name" id="fileName"></div>
    </div>

    <div class="form-group">
      <label for="modo">Tipo de análise</label>
      <select id="modo">
        <option value="resumo">Resumo executivo</option>
        <option value="riscos">Pontos de risco</option>
        <option value="obrigacoes">Obrigações das partes</option>
      </select>
    </div>

    <button id="btnAnalisar">Analisar contrato</button>

    <div class="resultado-header" id="resultadoHeader" style="display:none">
      <h2>Análise</h2>
      <button id="btnCopiar">Copiar</button>
    </div>

    <div id="resultado"></div>
  </div>

  <script src="/app.js"></script>
</body>
</html>
```

### 3. Criar `public/app.js`

```javascript
const textoEl = document.getElementById("texto");
const arquivoEl = document.getElementById("arquivo");
const fileNameEl = document.getElementById("fileName");
const modoEl = document.getElementById("modo");
const btnAnalisar = document.getElementById("btnAnalisar");
const btnCopiar = document.getElementById("btnCopiar");
const resultadoEl = document.getElementById("resultado");
const charCountEl = document.getElementById("charCount");
const resultadoHeader = document.getElementById("resultadoHeader");

// Contador de caracteres
textoEl.addEventListener("input", () => {
  const len = textoEl.value.length;
  charCountEl.textContent = `${len.toLocaleString("pt-BR")} / 80.000 caracteres (mínimo: 300)`;
  charCountEl.classList.toggle("alerta", len > 0 && (len < 300 || len > 80000));
});

// Exibir nome do arquivo selecionado
arquivoEl.addEventListener("change", () => {
  const file = arquivoEl.files[0];
  if (file) {
    fileNameEl.textContent = `Arquivo selecionado: ${file.name}`;
    textoEl.disabled = true;
    textoEl.style.opacity = "0.5";
  } else {
    fileNameEl.textContent = "";
    textoEl.disabled = false;
    textoEl.style.opacity = "1";
  }
});

// Copiar resultado
btnCopiar.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultadoEl.textContent);
  btnCopiar.textContent = "Copiado!";
  setTimeout(() => (btnCopiar.textContent = "Copiar"), 2000);
});

// Enviar análise
btnAnalisar.addEventListener("click", async () => {
  const arquivo = arquivoEl.files[0];
  const texto = textoEl.value.trim();
  const modo = modoEl.value;

  if (!arquivo && texto.length < 300) {
    resultadoEl.innerHTML = '<span class="erro">O texto deve ter no mínimo 300 caracteres.</span>';
    return;
  }

  // Preparar FormData
  const form = new FormData();
  form.append("modo", modo);

  if (arquivo) {
    form.append("arquivo", arquivo);
  } else {
    form.append("texto", texto);
  }

  // UI: estado de loading
  btnAnalisar.disabled = true;
  btnAnalisar.textContent = "Analisando...";
  resultadoEl.textContent = "";
  resultadoHeader.style.display = "none";

  try {
    const response = await fetch("/analisar", { method: "POST", body: form });

    if (!response.ok) {
      const data = await response.json();
      resultadoEl.innerHTML = `<span class="erro">Erro: ${data.error}</span>`;
      return;
    }

    // Consumir SSE via ReadableStream
    resultadoHeader.style.display = "flex";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Processar linhas completas do SSE
      const linhas = buffer.split("\n\n");
      buffer = linhas.pop(); // última parte pode estar incompleta

      for (const linha of linhas) {
        if (!linha.startsWith("data:")) continue;
        const json = JSON.parse(linha.slice(5).trim());

        if (json.error) {
          resultadoEl.innerHTML += `<span class="erro">\n\nErro: ${json.error}</span>`;
        } else if (json.token) {
          resultadoEl.textContent += json.token;
        }
        // json.done === true → stream acabou, loop vai parar naturalmente
      }
    }
  } catch (err) {
    resultadoEl.innerHTML = '<span class="erro">Erro de rede. Verifique o servidor.</span>';
  } finally {
    btnAnalisar.disabled = false;
    btnAnalisar.textContent = "Analisar contrato";
  }
});
```

---

## Critério de conclusão

- [ ] Contador de chars muda de cor ao ficar fora dos limites
- [ ] Selecionar PDF desabilita o textarea
- [ ] Texto aparece progressivamente na área de resultado
- [ ] Botão fica desabilitado durante a análise
- [ ] Botão "Copiar" copia o resultado e muda o texto temporariamente
- [ ] Erros do servidor aparecem na área de resultado

## Próximo passo

Com o frontend funcionando, execute os testes da [Spec 07 — Validação e Testes](./07-validacao.md).
