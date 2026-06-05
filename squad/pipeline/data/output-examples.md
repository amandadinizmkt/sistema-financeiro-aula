# Output Examples — Squad Financeiro Pessoal

## Exemplo de Rodada Completa — Março 2026

### Cenário
Amanda enviou:
- Extrato Bradesco (conta agência): 3 recebimentos de clientes + 2 despesas
- Extrato Nubank (conta cursos): 2 repasses de plataformas
- Print Hotmart: 1 venda de Workshop Claude (R$497)
- Print Kiwify: 1 assinatura do Clube IA (R$97)

---

### Output 1: transacoes-extraidas.json (Fernando)

Resultado final esperado:
- 8 lançamentos: 4 na Agência, 4 em Cursos (receitas brutas + taxas de plataforma separadas)
- 1 pendência: PIX recebido sem identificação
- 0 duplicatas removidas

---

### Output 2: dre-agencia.md (Diana)

```markdown
# DRE — Agência Fortecor | Março 2026
**Regime:** Caixa | **Elaborado por:** Squad Financeiro Pessoal | **Data:** 20/04/2026

---

## Demonstrativo de Resultado do Exercício

| Descrição | Valor (R$) | % Receita Líquida |
|-----------|-----------|-------------------|
| **Receita Bruta** | 5.700,00 | — |
| (-) Deduções e Impostos (DAS Simples) | (420,00) | — |
| **(=) Receita Líquida** | **5.280,00** | **100,0%** |
| (-) CPV — Custo do Produto/Serviço | — | 0,0% |
| **(=) Lucro Bruto** | **5.280,00** | **100,0%** |
| (-) Despesas Operacionais | (800,00) | 15,2% |
| **(=) EBITDA** | **4.480,00** | **84,8%** |
| **(=) Lucro Líquido** | **4.480,00** | **84,8%** |

---

## Indicadores de Saúde Financeira

| Indicador | Valor | Referência | Status |
|-----------|-------|------------|--------|
| Margem Bruta | 100,0% | > 60% para serviços | ✅ Saudável |
| Margem EBITDA | 84,8% | > 20% | ✅ Saudável |
| Margem Líquida | 84,8% | > 20% para serviços | ✅ Saudável |

---

> ⚠️ **Pendências excluídas:** R$ 250,00 em 1 lançamento aguardam confirmação e não estão refletidos neste DRE.
```

---

### Output 3: dre-cursos.md (Diana)

```markdown
# DRE — Cursos e Assinatura | Março 2026
**Regime:** Caixa | **Elaborado por:** Squad Financeiro Pessoal | **Data:** 20/04/2026

---

## Demonstrativo de Resultado do Exercício

| Descrição | Valor (R$) | % Receita Líquida |
|-----------|-----------|-------------------|
| **Receita Bruta** | 594,00 | — |
| (-) Deduções e Impostos | (0,00) | — |
| **(=) Receita Líquida** | **594,00** | **100,0%** |
| (-) CPV — Taxas de Plataforma | (59,40) | 10,0% |
| **(=) Lucro Bruto** | **534,60** | **90,0%** |
| (-) Despesas Operacionais | — | 0,0% |
| **(=) EBITDA** | **534,60** | **90,0%** |
| **(=) Lucro Líquido** | **534,60** | **90,0%** |

---

## Indicadores de Saúde Financeira

| Indicador | Valor | Referência | Status |
|-----------|-------|------------|--------|
| Margem Bruta | 90,0% | > 70% para digital | ✅ Saudável |
| Margem EBITDA | 90,0% | > 20% | ✅ Saudável |
| Margem Líquida | 90,0% | > 30% para digital | ✅ Saudável |
```

---

### Output 4: apps-script.gs (Diana)

Script .gs completo com:
- Variáveis de configuração comentadas
- Arrays com todos os 8 lançamentos do período
- Funções: `lancaTransacoes()`, `atualizaDRE()`, `atualizaDashboard()`, `executarTudo()`
- Instruções de uso no cabeçalho em português

---

### Output 5: dashboard-agencia.html (Victor)

Página HTML com:
- Header: "Dashboard Agência Fortecor — Março 2026"
- KPI Card "Receita Líquida": R$ 5.280,00 (cinza)
- KPI Card "Lucro Líquido": R$ 4.480,00 (verde)
- KPI Card "Margem Líquida": 84,8% (verde)
- KPI Card "Lançamentos": 4 transações
- Gráfico de barras: R$5.700 receita / R$1.220 despesas / R$4.480 lucro
- Gráfico de pizza: Imposto 34,4% / Freelancer 65,6%
- Tabela com 4 lançamentos

---

### Output 6: relatorio-auditoria.md (Renata)

Relatório final com:
- Status: ✅ APROVADO (todos os cálculos conferem)
- 3 insights para Agência (concentração de clientes, margem excepcional, modelo escalável)
- 2 insights para Cursos (fase inicial, margem forte)
- Diagnóstico consolidado positivo
- 3 recomendações priorizadas
- Frase de síntese: "Março foi um mês excelente: estrutura enxuta, margens acima do mercado."
