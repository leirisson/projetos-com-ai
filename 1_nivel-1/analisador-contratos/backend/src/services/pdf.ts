import pdfParse from "pdf-parse";

export async function extrairTexto(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  const texto = data.text.trim();

  if (!texto) {
    throw new Error(
      "O PDF não contém texto extraível. PDFs escaneados como imagem não são suportados."
    );
  }

  return texto;
}
