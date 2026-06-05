# Research Brief — Squad Financeiro Pessoal

## Contexto do Negócio

**Estrutura:** Dois centros de resultado sob o mesmo CNPJ (regime Simples Nacional presumido)
- **Agência Fortecor:** prestação de serviços de marketing — receitas de clientes empresariais via TED/PIX
- **Cursos e Assinatura:** produtos digitais e assinatura recorrente — receitas via Hotmart, Kiwify e plataformas similares

## Frameworks Financeiros Relevantes

### DRE Padrão Brasileiro (Regime de Caixa — PMEs)

O Demonstrativo de Resultado do Exercício (DRE) é a principal ferramenta de análise de resultado. Para negócios de serviços e produtos digitais de pequeno porte, a estrutura simplificada é:

```
(+) Receita Bruta de Serviços/Produtos
(-) Deduções: Impostos sobre Receita (DAS, ISS, PIS/COFINS conforme regime)
(=) Receita Líquida
(-) CPV — Custo do Produto/Serviço (custos diretos de entrega)
(=) Lucro Bruto
(-) Despesas Operacionais (administrativas, comerciais, pessoal, marketing)
(=) EBITDA / Resultado Operacional
(+/-) Resultado Financeiro (juros recebidos/pagos — geralmente irrelevante para PMEs simples)
(=) Lucro Líquido do Período
```

### Regime de Competência vs. Regime de Caixa

- **Regime de Caixa:** registra receitas e despesas na data do pagamento efetivo. Mais simples, padrão para este squad.
- **Regime de Competência:** registra na data de prestação do serviço, independente do pagamento. Exige provisões.

Para PMEs e negócios digitais com ciclos curtos (pagamento imediato via plataformas), Regime de Caixa é suficiente.

## Benchmarks de Referência por Tipo de Negócio

### Agências de Marketing e Serviços (Brasil, 2025)
- **Margem Bruta:** 60-80% (típica para serviços de baixo CPV)
- **Margem EBITDA:** 20-40% (após despesas operacionais)
- **Margem Líquida:** 15-35% (após impostos)
- **Despesas Operacionais / Receita:** abaixo de 50% é saudável
- **Concentração de clientes:** risco alto se top 3 clientes > 70% da receita

### Produtos Digitais e Infoprodutos (Brasil, 2025)
- **Margem Bruta:** 70-90% (pouquíssimo CPV — apenas taxas de plataforma)
- **Margem EBITDA:** 40-70% (após despesas de marketing e suporte)
- **Margem Líquida:** 30-60%
- **Taxas de plataformas:** Hotmart (7-14,9%), Kiwify (7,99%), Monetizze variável

### Negócios de Assinatura (SaaS/Clubes)
- **Churn mensal saudável:** < 5%
- **MRR (Receita Recorrente Mensal):** indicador mais importante para assinaturas
- **LTV / CAC:** deve ser > 3x para ser sustentável

## Categorias de Transações — Padrão Deste Squad

### Receitas
| Categoria | Descrição | Área |
|-----------|-----------|------|
| Receita de Serviço | Pagamentos de clientes da agência | Agência |
| Receita de Produto Digital | Vendas de cursos avulsos | Cursos |
| Receita de Assinatura | Cobranças recorrentes do clube | Cursos |

### Despesas
| Categoria | Descrição | Área |
|-----------|-----------|------|
| Imposto | DAS Simples, ISS, outros tributos | Qualquer |
| Despesa de Plataforma/Taxa | Taxas Hotmart, Kiwify, Stripe, gateway | Cursos/Agência |
| Despesa Operacional | Ferramentas, serviços, assinaturas SaaS | Qualquer |
| Despesa com Pessoal | Freelancers, colaboradores, CLT | Qualquer |
| Transferência Interna | Movimentação entre as duas contas | Eliminar na consolidação |

## Análise de Saúde Financeira — Semáforo

| Indicador | Verde ✅ | Amarelo ⚠️ | Vermelho 🔴 |
|-----------|---------|-----------|------------|
| Margem Líquida (Agência) | > 20% | 10-20% | < 10% |
| Margem Líquida (Digital) | > 30% | 15-30% | < 15% |
| Margem Bruta | > 60% | 40-60% | < 40% |
| Lucro Líquido | Positivo | Zero | Negativo |
| Concentração top 2 clientes | < 60% receita | 60-80% | > 80% |

## Fontes de Dados Típicas — Como Identificar

| Plataforma | Padrão de transação | Identifica área |
|------------|---------------------|-----------------|
| Extrato Bradesco/Nubank/Itaú PDF | TED/PIX recebido, débito automático | Via conta bancária cadastrada |
| Hotmart | "HOTMART INTERNET", repasse semanal | Cursos |
| Kiwify | "KIWIFY", repasse quinzenal | Cursos |
| Stripe | "STRIPE PAYMENTS" | Verificar produto associado |
| Google/Meta Ads | Débito em cartão ou conta | Despesa operacional |
