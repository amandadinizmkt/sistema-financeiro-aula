// Parses DRE markdown files to extract authoritative financial totais

export interface DRETotais {
  receita_bruta: number
  deducoes: number
  receita_liquida: number
  despesas_operacionais: number
  resultado: number
  distribuicao_lucro?: number
  margem_liquida?: number
}

function parseBRL(s: string): number {
  // Remove markdown bold, parentheses (negative), spaces
  const isNeg = s.includes('(') || s.trim().startsWith('-')
  const num = parseFloat(
    s.replace(/\*/g, '').replace(/[()R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  )
  return isNaN(num) ? 0 : isNeg ? -Math.abs(num) : num
}

function getTableCell(line: string, colIndex: number): string {
  const cells = line.split('|').map(c => c.trim())
  return cells[colIndex] ?? ''
}

function findValue(markdown: string, patterns: string[]): number {
  const lines = markdown.split('\n')
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (patterns.some(p => lower.includes(p.toLowerCase()))) {
      // Get value from second column of a markdown table row
      const cell = getTableCell(line, 2)
      if (/[\d,]/.test(cell)) return parseBRL(cell)
    }
  }
  return 0
}

export function parseDRETotais(markdown: string, vertical: 'agencia' | 'cursos' | 'consolidado'): DRETotais {
  if (!markdown) return emptyTotais()

  if (vertical === 'consolidado') {
    // consolidado table has vertical columns — extract from the last column
    const lines = markdown.split('\n')
    const totais: DRETotais = emptyTotais()
    for (const line of lines) {
      const lower = line.toLowerCase()
      const consolidadoCell = getTableCell(line, 4) // 4th col = Consolidado

      if (lower.includes('receita bruta') && !lower.includes('receita líquida') && /[\d,]/.test(consolidadoCell)) {
        totais.receita_bruta = parseBRL(consolidadoCell)
      } else if (lower.includes('receita líquida') && /[\d,]/.test(consolidadoCell)) {
        totais.receita_liquida = parseBRL(consolidadoCell)
      } else if (lower.includes('lucro líquido') && !lower.includes('resultado') && /[\d,]/.test(consolidadoCell)) {
        totais.resultado = parseBRL(consolidadoCell)
      } else if (lower.includes('despesas operacionais') && /[\d,]/.test(consolidadoCell)) {
        totais.despesas_operacionais = parseBRL(consolidadoCell)
      }
    }
    if (totais.receita_liquida > 0 && totais.resultado !== 0) {
      totais.margem_liquida = (totais.resultado / totais.receita_liquida) * 100
    }
    return totais
  }

  // For agencia and cursos: standard DRE table, value in 2nd col
  const totais: DRETotais = emptyTotais()

  totais.receita_bruta = Math.abs(findValue(markdown, ['Receita Bruta Total', 'Receita Bruta —', 'Receita Bruta\t', '**Receita Bruta']))
  totais.receita_liquida = Math.abs(findValue(markdown, ['(=) Receita Líquida']))
  totais.despesas_operacionais = -Math.abs(findValue(markdown, ['(-) Despesas Operacionais']))
  totais.resultado = findValue(markdown, ['(=) EBITDA / Lucro Líquido', '(=) EBITDA / Resultado', 'Lucro Líquido'])
  totais.distribuicao_lucro = findValue(markdown, ['Distribuição de Lucro', 'Lucro Distribuído'])

  // Compute deduções
  totais.deducoes = totais.receita_liquida - totais.receita_bruta

  if (totais.receita_liquida > 0) {
    totais.margem_liquida = (totais.resultado / totais.receita_liquida) * 100
  }

  return totais
}

function emptyTotais(): DRETotais {
  return { receita_bruta: 0, deducoes: 0, receita_liquida: 0, despesas_operacionais: 0, resultado: 0 }
}
