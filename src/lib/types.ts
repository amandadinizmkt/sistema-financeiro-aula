// Shared types and client-safe utilities

export interface Lancamento {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  categoria: string
  cliente_recorrente?: boolean
  fonte?: string
  nota?: string
}

export interface LancamentoPF {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  categoria: string
  conta: 'pf' | 'pj'
  nota?: string
}

export interface Totais {
  receita_bruta: number
  impostos?: number
  receita_liquida: number
  despesas_operacionais: number
  resultado_operacional: number
  distribuicao_lucro?: number
  deducao_nicolas?: number
  taxa_lastlink?: number
}

export interface EmpresaPJ {
  nome: string
  totais: Totais
  receitas: Lancamento[]
  despesas: Lancamento[]
  impostos?: Lancamento[]
  distribuicao_lucro?: Lancamento[]
}

export interface PJData {
  ultimo_sync: string | null
  periodo: string | null
  mes?: string | null
  run_id: string | null
  empresas: {
    agencia: EmpresaPJ
    cursos: EmpresaPJ
  }
  pendencias: unknown[]
  dre: {
    agencia: string
    cursos: string
    consolidado: string
  }
  lancamentos_manuais: Lancamento[]
}

export interface PFData {
  ultimo_sync: string | null
  periodo: string | null
  contas: {
    pf: {
      nome: string
      lancamentos: LancamentoPF[]
    }
  }
  resumo: {
    total_entradas: number
    total_saidas: number
    saldo: number
    pro_labore_recebido: number
  }
  lancamentos_manuais: LancamentoPF[]
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
