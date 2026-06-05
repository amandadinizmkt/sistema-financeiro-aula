---
execution: subagent
agent: victor
inputFile: squads/squad-financeiro-aula/output/dre-agencia.md
outputFile: squads/squad-financeiro-aula/output/dashboard-consolidado.html
model_tier: powerful
---

# Step 05: Victor Visual — Geração dos Dashboards HTML

## Context Loading

Carregar antes de executar:
- `squads/squad-financeiro-aula/output/{run_id}/dre-agencia.md` — DRE da Agência com todos os valores
- `squads/squad-financeiro-aula/output/{run_id}/dre-cursos.md` — DRE de Cursos com todos os valores
- `squads/squad-financeiro-aula/output/{run_id}/dre-consolidado.md` — DRE Consolidado com todos os valores
- `squads/squad-financeiro-aula/output/{run_id}/transacoes-extraidas.json` — lançamentos para tabela detalhada
- `squads/squad-financeiro-aula/agents/victor.agent.md` — persona e princípios do Victor

## Instructions

### Process

1. **Extrair todos os dados numéricos** dos três DREs: Receita Bruta, Receita Líquida, Lucro Bruto, Despesas por categoria, Lucro Líquido, Margem Bruta, Margem EBITDA, Margem Líquida.

2. **Gerar dashboard-agencia.html** com:
   - Header: título "Dashboard Agência Fortecor — {Período}", data de geração
   - 4 KPI cards: Receita Líquida | Lucro Líquido | Margem Líquida | Total de Lançamentos
   - Gráfico de barras: Receita vs Despesas vs Lucro (Chart.js inline)
   - Gráfico de pizza: composição das despesas por categoria
   - Tabela detalhada com todos os lançamentos da Agência
   - Cores semáforo nos KPI cards baseadas nos benchmarks do framework financeiro

3. **Gerar dashboard-cursos.html** com a mesma estrutura para Cursos e Assinatura.

4. **Gerar dashboard-consolidado.html** com:
   - Mesma estrutura base
   - Seção extra de comparativo entre as duas áreas (gráfico de barras lado a lado)
   - KPI cards para cada área + cards consolidados

5. **Garantir que os três arquivos são standalone**: Chart.js embutido inline (não CDN), CSS inline na tag `<style>`, zero dependências externas.

## Output Format

Três arquivos HTML com a seguinte estrutura:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard {ÁREA} — {PERÍODO}</title>
  <style>
    /* CSS completo inline — layout responsivo com Flexbox */
    /* Paleta: verde #27AE60, amarelo #F39C12, vermelho #E74C3C */
    /* Cards, tabelas, gráficos */
  </style>
</head>
<body>
  <header>
    <h1>🎯 Dashboard {ÁREA}</h1>
    <p>{Período} | Regime de Caixa | Gerado em {DATA} pelo Squad Financeiro Pessoal</p>
  </header>
  
  <section class="kpi-cards">
    <!-- 4 cards com cores semáforo -->
  </section>
  
  <section class="graficos">
    <!-- Chart.js inline -->
  </section>
  
  <section class="tabela-detalhada">
    <!-- Todos os lançamentos do período -->
  </section>
</body>
<script>
  /* Chart.js inline ou embutido */
</script>
</html>
```

## Output Example

Dashboard gerado com:
- KPI Card "Receita Líquida": R$ 5.280,00 (fundo branco, sem semáforo — é só um número)
- KPI Card "Lucro Líquido": R$ 4.480,00 (fundo verde — positivo)
- KPI Card "Margem Líquida": 84,8% (fundo verde — acima de 15%)
- KPI Card "Lançamentos": 4 transações no período
- Gráfico de barras: Receita R$5.700 | Despesas R$1.220 | Lucro R$4.480
- Tabela com as 4 transações da Agência

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. Qualquer arquivo HTML depende de recursos externos (CDN, imagens externas) que podem não estar disponíveis offline
2. Valores nos cards HTML divergem dos valores nos DREs de Diana (inconsistência de dados)

## Quality Criteria

- [ ] Três arquivos HTML gerados: dashboard-agencia.html, dashboard-cursos.html, dashboard-consolidado.html
- [ ] Chart.js embutido inline — nenhuma dependência externa quebrada
- [ ] Cores semáforo corretas em todos os KPI cards
- [ ] Tabela de lançamentos presente em cada dashboard
- [ ] Valores em formato brasileiro (R$ X.XXX,XX)
- [ ] Layout responsivo (funciona em tela pequena)
