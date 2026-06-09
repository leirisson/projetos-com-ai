import { ModoAnalise } from '../types'

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
}

export function getPrompt(texto: string, modo: ModoAnalise){
    return `${SISTEMA}\n\n${INSTRUCOES[modo]}\n\n---\n\nCONTRATO:\n${texto}`
}

export function getMensagemSistema(): string {
  return SISTEMA;
}