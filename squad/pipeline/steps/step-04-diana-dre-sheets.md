---
execution: inline
agent: diana
inputFile: squads/squad-financeiro-pessoal/output/transacoes-extraidas.json
outputFile: squads/squad-financeiro-pessoal/output/dre-agencia.md
model_tier: powerful
---

# Step 04: Diana Demonstrativo — DREs e Google Apps Script

## Context Loading

Carregar antes de executar:
- `squads/squad-financeiro-pessoal/output/{run_id}/transacoes-extraidas.json` — lançamentos confirmados pela usuária
- `squads/squad-financeiro-pessoal/agents/diana.agent.md` — persona e princípios da Diana
- `squads/squad-financeiro-pessoal/agents/diana/tasks/build-dre.md` — processo de construção dos DREs
- `squads/squad-financeiro-pessoal/agents/diana/tasks/generate-apps-script.md` — processo de geração do script
- `squads/squad-financeiro-pessoal/pipeline/data/domain-framework.md` — padrão brasileiro de DRE

## Instructions

### Process

1. **Executar task build-dre.md**: construir os três DREs a partir dos lançamentos confirmados:
   - Agregar lançamentos por categoria de DRE para cada área
   - Calcular todas as linhas do DRE (Receita Bruta → Lucro Líquido)
   - Calcular indicadores de margem com classificação semáforo
   - Montar DRE Consolidado eliminando transferências internas
   - Salvar: `output/{run_id}/dre-agencia.md`, `output/{run_id}/dre-cursos.md`, `output/{run_id}/dre-consolidado.md`

2. **Executar task generate-apps-script.md**: gerar o Google Apps Script completo:
   - Estruturar todos os lançamentos como arrays JavaScript
   - Gerar função `lancaTransacoes()` com os dados do período
   - Gerar função `atualizaDRE()` com os dados calculados
   - Gerar função `atualizaDashboard()` com as tabelas de indicadores
   - Gerar função master `executarTudo()`
   - Adicionar instruções de uso em português no cabeçalho
   - Salvar: `output/{run_id}/apps-script.gs`

3. **Apresentar resumo dos DREs inline** para a usuária poder verificar os números antes de prosseguir para os dashboards:
   - Tabela resumo com Receita Líquida, Lucro Líquido e Margem Líquida por área
   - Indicar quaisquer ⚠️ alertas de margem

## Output Format

Três arquivos DRE em markdown (formato definido na task build-dre.md) + um arquivo .gs.

Resumo inline apresentado à usuária:

```
✅ DREs gerados para {PERÍODO}

| Área | Receita Líquida | Lucro Líquido | Margem Líquida |
|------|----------------|---------------|----------------|
| Agência Fortecor | R$ 0,00 | R$ 0,00 | 0,0% ✅/⚠️/🔴 |
| Cursos e Assinatura | R$ 0,00 | R$ 0,00 | 0,0% ✅/⚠️/🔴 |
| CONSOLIDADO | R$ 0,00 | R$ 0,00 | 0,0% ✅/⚠️/🔴 |

📁 Arquivos gerados:
- output/{run_id}/dre-agencia.md
- output/{run_id}/dre-cursos.md
- output/{run_id}/dre-consolidado.md
- output/{run_id}/apps-script.gs (cole no Google Sheets → Extensões → Apps Script)
```

## Output Example

```
✅ DREs gerados para Março 2026

| Área | Receita Líquida | Lucro Líquido | Margem Líquida |
|------|----------------|---------------|----------------|
| Agência Fortecor | R$ 5.280,00 | R$ 4.480,00 | 84,8% ✅ |
| Cursos e Assinatura | R$ 534,60 | R$ 534,60 | 100,0% ✅ |
| CONSOLIDADO | R$ 5.814,60 | R$ 5.014,60 | 86,2% ✅ |

⚠️ Lembrete: R$ 250,00 em 1 lançamento pendente não está incluído nos DREs acima.

📁 Arquivos gerados:
- output/run-2026-04-20/dre-agencia.md ← abrir para ver DRE completo
- output/run-2026-04-20/dre-cursos.md
- output/run-2026-04-20/dre-consolidado.md
- output/run-2026-04-20/apps-script.gs ← cole no seu Google Sheets

📋 Como usar o apps-script.gs:
1. Abra sua planilha no Google Sheets
2. Clique em Extensões > Apps Script
3. Cole o conteúdo do arquivo apps-script.gs
4. Ajuste NOME_ABA_LANCAMENTOS para o nome da sua aba atual
5. Clique em Executar > executarTudo
```

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. Lucro Líquido em qualquer DRE não bate com a soma dos lançamentos da respectiva área (erro matemático)
2. Script .gs gerado com erro de sintaxe JavaScript

## Quality Criteria

- [ ] Três arquivos DRE gerados (agencia, cursos, consolidado)
- [ ] Arquivo apps-script.gs gerado com instruções de uso em português
- [ ] Valores no script .gs idênticos aos valores nos DREs
- [ ] Indicadores de margem calculados e classificados nos três DREs
- [ ] Resumo inline apresentado à usuária com tabela comparativa
