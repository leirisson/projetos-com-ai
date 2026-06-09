export type ModoAnalise = "riscos" | "obrigacoes" | "resumo";


export interface AnaliseRequest {
  modo: ModoAnalise;
  texto: string;
}