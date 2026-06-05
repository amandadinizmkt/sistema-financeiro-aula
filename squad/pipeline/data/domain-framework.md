# Domain Framework — Análise Financeira para PMEs Digitais

## Metodologia do Squad

Este squad opera em 4 etapas sequenciais, cada uma com um agente especializado:

### Etapa 1 — Coleta e Classificação (Fernando Fichador)

**Objetivo:** Transformar documentos brutos (PDFs, prints) em dados estruturados e confiáveis.

**Princípios operacionais:**
- Extrair cada transação individualmente — nunca agregar sem evidência
- Separar receita bruta de taxas de plataforma em dois lançamentos distintos
- Classificar por área via conta bancária de origem (não por conteúdo do texto)
- Marcar como pendente qualquer transação ambígua — nunca inferir sem base
- Verificar duplicatas em múltiplos documentos do mesmo período

**Saída esperada:** JSON estruturado com lançamentos por área, totais calculados, pendências listadas

### Etapa 2 — Demonstrativos (Diana Demonstrativo)

**Objetivo:** Construir DREs formais e integração com Google Sheets.

**Estrutura do DRE Padrão (ordem obrigatória):**
1. Receita Bruta
2. (-) Deduções e Impostos
3. (=) Receita Líquida ← base para cálculo de percentuais
4. (-) CPV / Custo do Produto Vendido
5. (=) Lucro Bruto
6. (-) Despesas Operacionais
7. (=) EBITDA
8. (=) Lucro Líquido (= EBITDA para negócios sem despesas financeiras significativas)

**Regras de consolidação:**
- Transferências internas = zeragem bilateral (receita em uma área = despesa na outra → ambas somam zero na consolidação)
- Não somar DREs diretamente — verificar e eliminar transferências primeiro

**Integração Google Sheets:**
- Script colável sem modificações de código
- Lançar na aba existente (nunca criar nova aba de lançamentos)
- Criar aba DRE e aba Dashboard automaticamente
- Comentários em português em todo o código

### Etapa 3 — Visualização (Victor Visual)

**Objetivo:** Dashboard HTML autocontido que comunica saúde financeira em 10 segundos.

**Hierarquia visual (de cima para baixo):**
1. Header com período e regime
2. KPI Cards (4 métricas principais com cor semáforo)
3. Gráficos comparativos (receita vs despesa vs lucro)
4. Composição de despesas (pizza)
5. Tabela de lançamentos completa

**Paleta semáforo:**
- Verde `#27AE60`: saudável (acima do benchmark)
- Amarelo `#F39C12`: atenção (próximo ao limite)
- Vermelho `#E74C3C`: crítico (abaixo do mínimo)
- Cinza `#7F8C8D`: neutro (sem benchmark aplicável)

**Requisito técnico:** Chart.js embutido inline, zero dependências externas

### Etapa 4 — Auditoria e Diagnóstico (Renata Revisão)

**Objetivo:** Verificar consistência de todos os outputs e produzir diagnóstico financeiro acionável.

**Protocolo de auditoria:**
1. Recalcular totais independentemente (não confiar nos DREs sem verificação)
2. Verificar cobertura de documentos
3. Identificar anomalias (> 20% da receita ou despesa = mencionar obrigatoriamente)
4. Calcular percentual não auditado (pendências)

**Estrutura de insight obrigatória:**
- O que aconteceu (dado concreto com número)
- O que isso significa (implicação de negócio)
- O que sugere fazer (ação direcional)
- Nível de confiança (Alta/Média/Baixa)

**Estrutura de recomendação obrigatória:**
- Ação: o que fazer especificamente
- Impacto esperado: resultado quantificado quando possível
- Confiança: Alta/Média/Baixa
- Esforço: Baixo/Médio/Alto
- Prioridade: Alta/Média/Baixa

## Gestão de Dois Centros de Resultado

### Identificação de Área por Conta Bancária
Este é o critério primário — não o conteúdo da transação:
- Conta bancária X → Agência Fortecor (independente do que diz a descrição)
- Conta bancária Y → Cursos e Assinatura
- Plataformas digitais (Hotmart, Kiwify) → Cursos e Assinatura por padrão
- Quando ambíguo → pendente de confirmação

### Visão por Área vs. Visão Consolidada
- **Por área:** toma decisões sobre eficiência de cada negócio separadamente
- **Consolidada:** visão do patrimônio total, eliminando movimentações internas

Ambas as visões são necessárias. Uma área pode estar perdendo dinheiro enquanto a outra compensa — a visão consolidada mascara isso.
