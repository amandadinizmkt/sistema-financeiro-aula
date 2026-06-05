---
task: "Construção dos DREs (Agência, Cursos e Consolidado)"
order: 1
input: |
  - transacoes_agencia: lançamentos categorizados da Agência Fortecor
  - transacoes_cursos: lançamentos categorizados de Cursos/Assinatura
  - periodo: mês/ano de referência
  - pendencias_excluidas: valor total de lançamentos pendentes de confirmação
output: |
  - dre_agencia: DRE completo em markdown da Agência Fortecor
  - dre_cursos: DRE completo em markdown de Cursos/Assinatura
  - dre_consolidado: DRE consolidado em markdown (sem dupla contagem)
  - indicadores: objeto com as três margens por área e consolidado
---

# Construção dos DREs

Transforma os lançamentos estruturados de Fernando em três Demonstrativos de Resultado do Exercício (DRE) formais seguindo o padrão brasileiro: DRE da Agência Fortecor, DRE de Cursos/Assinatura e DRE Consolidado.

## Process

1. **Agregar lançamentos por categoria de DRE**: mapear as categorias de Fernando para as linhas do DRE:
   - "Receita de Serviço" → Receita Bruta (Agência)
   - "Receita de Produto Digital" + "Receita de Assinatura" → Receita Bruta (Cursos)
   - "Imposto" → Deduções e Impostos
   - "Despesa de Plataforma/Taxa" → CPV (Custo do Produto Vendido)
   - "Despesa Operacional" → Despesas Operacionais
   - "Transferência Interna" → marcar para eliminação no consolidado

2. **Calcular cada linha do DRE por área**:
   - Receita Bruta = soma de todas as receitas da área
   - (-) Deduções e Impostos = impostos do período
   - (=) Receita Líquida = Receita Bruta - Deduções
   - (-) CPV/CMV = taxas de plataforma + custos diretos de entrega
   - (=) Lucro Bruto = Receita Líquida - CPV
   - (-) Despesas Operacionais = todas as demais despesas
   - (=) EBITDA = Lucro Bruto - Despesas Operacionais
   - (=) Lucro Líquido = EBITDA (negócios simples sem depreciação/financeiro relevante)

3. **Calcular indicadores de margem** por área e para o consolidado:
   - Margem Bruta = (Lucro Bruto / Receita Líquida) × 100
   - Margem EBITDA = (EBITDA / Receita Líquida) × 100
   - Margem Líquida = (Lucro Líquido / Receita Líquida) × 100
   - Classificar cada margem: ✅ Saudável / ⚠️ Atenção / 🔴 Crítico

4. **Construir DRE Consolidado**: somar as duas áreas eliminando transferências internas (lançamentos marcados como "Transferência Interna" aparecem como receita em uma área e despesa na outra — devem ser zerados no consolidado).

5. **Formatar os três documentos em markdown** com cabeçalho de período, tabela DRE completa, seção de indicadores com classificação, e nota sobre pendências excluídas.

## Output Format

```markdown
# DRE — {ÁREA} | {Mês} {Ano}
**Regime:** Caixa | **Elaborado por:** Squad Financeiro Pessoal

---

## Demonstrativo de Resultado do Exercício

| Descrição | Valor (R$) | % Receita Líquida |
|-----------|-----------|-------------------|
| **Receita Bruta** | 0,00 | — |
| (-) Deduções e Impostos | (0,00) | — |
| **(=) Receita Líquida** | **0,00** | **100,0%** |
| (-) CPV / Custo do Produto Vendido | (0,00) | 0,0% |
| **(=) Lucro Bruto** | **0,00** | **0,0%** |
| (-) Despesas Operacionais | (0,00) | 0,0% |
| **(=) EBITDA** | **0,00** | **0,0%** |
| **(=) Lucro Líquido** | **0,00** | **0,0%** |

---

## Indicadores de Saúde Financeira

| Indicador | Valor | Referência | Status |
|-----------|-------|------------|--------|
| Margem Bruta | 0,0% | >60% (serviços) / >70% (digital) | ✅/⚠️/🔴 |
| Margem EBITDA | 0,0% | >20% | ✅/⚠️/🔴 |
| Margem Líquida | 0,0% | >15% | ✅/⚠️/🔴 |

---

> ⚠️ **Pendências excluídas:** R$ 0,00 em lançamentos aguardam confirmação e não estão refletidos neste DRE.
```

## Output Example

```markdown
# DRE — Agência Fortecor | Março 2026
**Regime:** Caixa | **Elaborado por:** Squad Financeiro Pessoal

---

## Demonstrativo de Resultado do Exercício

| Descrição | Valor (R$) | % Receita Líquida |
|-----------|-----------|-------------------|
| **Receita Bruta** | 5.700,00 | — |
| (-) Deduções e Impostos (DAS Simples) | (420,00) | — |
| **(=) Receita Líquida** | **5.280,00** | **100,0%** |
| (-) CPV — Custo do Produto/Serviço | (0,00) | 0,0% |
| **(=) Lucro Bruto** | **5.280,00** | **100,0%** |
| (-) Despesas Operacionais | (800,00) | 15,2% |
| **(=) EBITDA** | **4.480,00** | **84,8%** |
| **(=) Lucro Líquido** | **4.480,00** | **84,8%** |

---

## Indicadores de Saúde Financeira

| Indicador | Valor | Referência | Status |
|-----------|-------|------------|--------|
| Margem Bruta | 100,0% | >60% (serviços) | ✅ Saudável |
| Margem EBITDA | 84,8% | >20% | ✅ Saudável |
| Margem Líquida | 84,8% | >15% | ✅ Saudável |

---

> ⚠️ **Pendências excluídas:** R$ 250,00 em 1 lançamento aguardam confirmação e não estão refletidos neste DRE.
```

## Quality Criteria

- [ ] Todas as linhas do DRE têm valores que somam corretamente (verificar aritmética)
- [ ] Coluna "% Receita Líquida" calculada corretamente para todas as linhas
- [ ] Transferências internas identificadas e eliminadas no DRE Consolidado
- [ ] Três indicadores calculados e classificados para cada DRE
- [ ] Nota de pendências presente quando há lançamentos excluídos

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. Lucro Líquido do DRE não bate com a soma algébrica de receitas e despesas dos lançamentos (erro de cálculo)
2. DRE Consolidado contém valores de transferências internas que deveriam ser eliminados (dupla contagem)
