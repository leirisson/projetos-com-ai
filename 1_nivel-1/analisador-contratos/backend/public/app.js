const textoEl = document.getElementById("texto");
const arquivoEl = document.getElementById("arquivo");
const fileNameEl = document.getElementById("fileName");
const modoEl = document.getElementById("modo");
const btnAnalisar = document.getElementById("btnAnalisar");
const btnParar = document.getElementById("btnParar");
const btnCopiar = document.getElementById("btnCopiar");

let abortController = null;
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

// Parar streaming
btnParar.addEventListener("click", () => {
  if (abortController) abortController.abort();
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
  abortController = new AbortController();
  btnAnalisar.disabled = true;
  btnAnalisar.textContent = "Analisando...";
  btnParar.style.display = "block";
  resultadoEl.textContent = "";
  resultadoHeader.style.display = "none";

  try {
    const response = await fetch("/analisar", { method: "POST", body: form, signal: abortController.signal });

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
    let markdownAcumulado = "";

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
          markdownAcumulado += json.token;
          resultadoEl.innerHTML = marked.parse(markdownAcumulado);
        }
        // json.done === true → stream acabou, loop vai parar naturalmente
      }
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      resultadoEl.innerHTML = '<span class="erro">Erro de rede. Verifique o servidor.</span>';
    }
  } finally {
    abortController = null;
    btnAnalisar.disabled = false;
    btnAnalisar.textContent = "Analisar contrato";
    btnParar.style.display = "none";
  }
});
