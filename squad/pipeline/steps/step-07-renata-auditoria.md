---
execution: inline
agent: renata
inputFile: squads/squad-financeiro-aula/output/transacoes-extraidas.json
outputFile: squads/squad-financeiro-aula/output/relatorio-auditoria.md
model_tier: powerful
---

# Step 07: Renata Revisão — Auditoria e Diagnóstico Final

## Context Loading

Carregar antes de executar:
- `squads/squad-financeiro-aula/output/{run_id}/transacoes-extraidas.json` — lançamentos originais de Fernando
- `squads/squad-financeiro-aula/output/{run_id}/dre-agencia.md` — DRE Agência de Diana
- `squads/squad-financeiro-aula/output/{run_id}/dre-cursos.md` — DRE Cursos de Diana
- `squads/squad-financeiro-aula/output/{run_id}/dre-consolidado.md` — DRE Consolidado de Diana
- `squads/squad-financeiro-aula/agents/renata.agent.md` — persona e princípios da Renata
- `squads/squad-financeiro-aula/pipeline/data/quality-criteria.md` — critérios de qualidade financeira

## Instructions

### Process

1. **Auditoria matemática independente**: recalcular os totais de receita, despesa e lucro líquido por área diretamente a partir dos lançamentos JSON do Fernando. Comparar com os valores dos DREs de Diana. Se divergência > R$0,01, marcar falha de auditoria e descrever a discrepância.

2. **Auditoria de cobertura**: verificar que todos os documentos listados em `documentos_processados` geraram lançamentos. Calcular o percentual do valor total que está em pendências (não auditado).

3. **Análise de anomalias**: para cada área, identificar:
   - Lançamentos que representam > 20% da receita ou das despesas
   - Categorias de despesa que parecem incomuns para o tipo de negócio
   - Meses sem movimentação em alguma categoria esperada

4. **Produzir diagnóstico por área**: para cada área (Agência e Cursos), escrever 2-3 insights usando a estrutura: dado concreto → o que significa → o que sugere. Cada insight com nível de confiança.

5. **Produzir diagnóstico consolidado**: visão geral do negócio, comparação entre áreas, concentração de risco, tendências.

6. **Formular 3-5 recomendações priorizadas**: ação específica + impacto esperado + confiança + esforço + prioridade. Ordenar de Alta a Baixa prioridade.

7. **Montar e salvar relatorio-auditoria.md**: estrutura completa com Status de Auditoria + Diagnóstico por Área + Diagnóstico Consolidado + Recomendações + Metodologia + Frase de Síntese.

## Output Format

```markdown
# Relatório de Auditoria Financeira — {PERÍODO}
**Gerado por:** Renata Revisão | **Data:** {DATA}

---

## ✅/❌ Status de Auditoria: APROVADO/REPROVADO

[Tabela de verificações]

---

## 📊 Diagnóstico por Área

### Agência Fortecor
[2-3 insights]

### Cursos e Assinatura
[2-3 insights]

---

## 📈 Diagnóstico Consolidado
[Visão geral + comparativo entre áreas]

---

## 🎯 Recomendações

[3-5 recomendações priorizadas]

---

## Metodologia
[Período, regime, fontes, valor auditado, valor pendente]

**[Frase de síntese do período]**
```

## Output Example

```markdown
# Relatório de Auditoria Financeira — Março 2026
**Gerado por:** Renata Revisão | **Data:** 20/04/2026

---

## ✅ Status de Auditoria: APROVADO

| Verificação | Status |
|-------------|--------|
| Matemática — Agência (R$ 4.480,00) | ✅ Passou |
| Matemática — Cursos (R$ 534,60) | ✅ Passou |
| Matemática — Consolidado (R$ 5.014,60) | ✅ Passou |
| Cobertura de documentos (4/4) | ✅ Completo |
| Pendências não auditadas | R$ 250,00 (4,3% do total) |

---

## 📊 Diagnóstico por Área

### Agência Fortecor

1. **Receita concentrada em 2 clientes (R$ 5.700,00 total).** A Agência faturou R$ 3.500,00 de um cliente e R$ 2.200,00 de outro. Isso significa 100% da receita dependendo de apenas 2 relacionamentos comerciais — se um sair, o faturamento cai entre 39% e 61% instantaneamente. Sugere desenvolver ativamente um terceiro cliente até junho. (Alta confiança — dado direto do extrato.)

2. **Margem Líquida de 84,8% — excepcional.** De cada R$100 faturados, R$84,80 ficam após impostos e despesas. O benchmark para agências de marketing no Brasil fica entre 15% e 35%. Você está 2,5x acima do benchmark. Isso significa que a estrutura está enxuta — ponto de força a ser mantido. (Alta confiança.)

3. **Única despesa operacional: freelancer de design (R$800,00).** Representa 15,2% da receita líquida — saudável. Atenção: esse modelo pode não escalar se a carteira de clientes dobrar. (Média confiança — um período, sem histórico.)

### Cursos e Assinatura

1. **R$ 594,00 de receita bruta — fase inicial do negócio.** O volume de cursos/assinaturas ainda é pequeno em relação à agência (10% da receita total). Isso é esperado para um negócio em construção, mas sinaliza potencial não capturado. A área tem margem de 100% — cada novo cliente é lucro direto. (Alta confiança.)

2. **Taxas de plataforma: R$59,40 (10% da receita bruta).** Hotmart e Kiwify cobram percentuais equivalentes. Quando o volume crescer acima de R$3.000/mês, vale pesquisar planos com taxas menores ou plataformas próprias. (Baixa confiança — muito cedo para decidir.)

---

## 📈 Diagnóstico Consolidado

**Resultado do Período: Excelente.**

- Receita Líquida Total: R$ 5.814,60
- Lucro Líquido Total: R$ 5.014,60
- Margem Líquida Consolidada: 86,2% (benchmark: 15%+) ✅

A agência responde por 98% da receita. O negócio está saudável financeiramente, mas estrategicamente dependente de um único fluxo. A diversificação via cursos e assinaturas está no caminho certo — precisa de volume.

---

## 🎯 Recomendações

1. **Prospectar terceiro cliente para a Agência** — Prioridade: Alta | Confiança: Alta | Esforço: Alto. Reduz risco de concentração de 100% → 66% com 3 clientes. Meta: novo cliente ativo até junho/2026.

2. **Planejar campanha ou lançamento para Cursos** — Prioridade: Alta | Confiança: Média | Esforço: Médio. Com margem de 100% em cursos, cada real de venda vira lucro direto. Um lançamento ou campanha de reativação tem ROI imediato.

3. **Confirmar lançamento pendente de R$250,00** — Prioridade: Média | Confiança: Alta | Esforço: Baixo. PIX sem identificação — verificar no extrato e lançar na área correta no próximo ciclo.

---

## Metodologia

- **Período:** Março 2026
- **Regime:** Caixa
- **Documentos processados:** 4 arquivos
- **Valor total auditado:** R$ 6.064,60 identificado / R$ 5.814,60 auditado (95,7%)
- **Valor pendente:** R$ 250,00 (4,3%) — aguarda confirmação

**Março foi um mês excelente: estrutura de custos enxuta, margens acima do mercado, e uma clara oportunidade de crescimento em cursos. Foco para abril: venda e prospecção.**
```

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. Relatório entregue com auditoria matemática reprovada sem descrição clara da discrepância encontrada
2. Recomendações sem campos de prioridade, confiança e esforço

## Quality Criteria

- [ ] Auditoria matemática realizada independentemente (não confia cegamente nos DREs)
- [ ] Status de auditoria declarado (APROVADO ou REPROVADO) com tabela de verificações
- [ ] Pelo menos 2 insights por área com estrutura: dado → significado → sugestão
- [ ] 3-5 recomendações priorizadas com todos os campos preenchidos
- [ ] Percentual de valor pendente calculado e declarado
- [ ] Frase de síntese no final do relatório
