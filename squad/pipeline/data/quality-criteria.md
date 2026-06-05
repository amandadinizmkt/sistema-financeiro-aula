# Quality Criteria — Squad Financeiro Pessoal

## Critérios de Qualidade por Agente

### Fernando Fichador — Extração

| Critério | Verificação | Nível |
|----------|------------|-------|
| Todos os documentos processados | Verificar lista `documentos_processados` | BLOQUEANTE |
| Sem lançamentos com campos vazios | Verificar que data, valor e tipo estão preenchidos | BLOQUEANTE |
| Sem duplicatas | Mesma data+valor+descrição não aparece duas vezes | BLOQUEANTE |
| Totais corretos | `saldo_liquido` = soma algébrica dos lançamentos | BLOQUEANTE |
| Taxas de plataforma separadas | Hotmart/Kiwify/Stripe = 2 lançamentos (bruto + taxa) | IMPORTANTE |
| Pendências documentadas | Transações ambíguas têm descrição do problema | IMPORTANTE |

### Diana Demonstrativo — DRE e Script

| Critério | Verificação | Nível |
|----------|------------|-------|
| Estrutura padrão de DRE | 8 linhas obrigatórias presentes em todos os DREs | BLOQUEANTE |
| Aritmética correta | Lucro Líquido = soma algébrica de todos os lançamentos | BLOQUEANTE |
| Consolidação correta | Transferências internas eliminadas no DRE Consolidado | BLOQUEANTE |
| Três DREs gerados | agencia.md + cursos.md + consolidado.md | BLOQUEANTE |
| Script colável | .gs sem erros de sintaxe e com comentários | IMPORTANTE |
| Indicadores calculados | Margem Bruta, EBITDA e Líquida com classificação | IMPORTANTE |
| Pendências excluídas | Nota com valor pendente presente quando aplicável | IMPORTANTE |

### Victor Visual — Dashboards

| Critério | Verificação | Nível |
|----------|------------|-------|
| Três HTMLs gerados | agencia + cursos + consolidado | BLOQUEANTE |
| Sem dependências externas | Todos os recursos embutidos inline | BLOQUEANTE |
| Valores consistentes com DREs | Números nos cards = números nos DREs de Diana | BLOQUEANTE |
| Cores semáforo corretas | Benchmarks aplicados conforme tabela de referência | IMPORTANTE |
| Tabela de lançamentos | Todos os lançamentos do período presentes | IMPORTANTE |
| Formatação brasileira | R$ X.XXX,XX em todos os valores | IMPORTANTE |

### Renata Revisão — Auditoria

| Critério | Verificação | Nível |
|----------|------------|-------|
| Auditoria matemática realizada | Totais recalculados independentemente | BLOQUEANTE |
| Status de auditoria declarado | APROVADO ou REPROVADO explícito | BLOQUEANTE |
| Insights por área | Mínimo 2 por área com estrutura completa | IMPORTANTE |
| Recomendações priorizadas | 3-5 com todos os 5 campos preenchidos | IMPORTANTE |
| Percentual não auditado | Calculado e declarado | IMPORTANTE |
| Frase de síntese | Presente no encerramento | DESEJÁVEL |

## Thresholds de Saúde Financeira

### Para Agência de Serviços
| Indicador | Verde | Amarelo | Vermelho |
|-----------|-------|---------|----------|
| Margem Líquida | > 20% | 10-20% | < 10% |
| Margem Bruta | > 60% | 40-60% | < 40% |
| Concentração top 2 clientes | < 60% receita | 60-80% | > 80% |
| Despesas Operacionais/Receita | < 40% | 40-60% | > 60% |

### Para Produtos Digitais / Assinatura
| Indicador | Verde | Amarelo | Vermelho |
|-----------|-------|---------|----------|
| Margem Líquida | > 30% | 15-30% | < 15% |
| Margem Bruta | > 70% | 50-70% | < 50% |
| Taxas de plataforma/Receita bruta | < 12% | 12-20% | > 20% |

### Para Visão Consolidada
| Indicador | Verde | Amarelo | Vermelho |
|-----------|-------|---------|----------|
| Lucro Líquido | Positivo | Zero | Negativo |
| Margem Líquida Consolidada | > 20% | 10-20% | < 10% |

## Critérios de Rejeição Absoluta (Veto)

Se qualquer um destes for verdade, o pipeline deve parar:

1. **Auditoria matemática reprovada com diferença > R$1,00**: indica erro nos cálculos que invalida todo o relatório
2. **Script .gs com erro de sintaxe**: impede uso pela usuária
3. **HTML com dependências externas quebradas**: dashboard não abre offline
4. **DRE com transferências internas não eliminadas**: resultado consolidado incorreto (dupla contagem)
