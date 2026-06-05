---
task: "Geração do Google Apps Script para atualização da planilha"
order: 2
input: |
  - transacoes_agencia: lançamentos estruturados da Agência
  - transacoes_cursos: lançamentos estruturados de Cursos/Assinatura
  - dre_agencia: dados calculados do DRE da Agência
  - dre_cursos: dados calculados do DRE de Cursos
  - dre_consolidado: dados calculados do DRE Consolidado
  - periodo: mês/ano de referência
output: |
  - apps_script: arquivo .gs completo pronto para colar no editor do Google Sheets
  - instrucoes: passo a passo em português de como usar o script
---

# Geração do Google Apps Script

Produz um script Google Apps Script completo que a usuária pode colar no editor de scripts da sua planilha existente para: (1) lançar todas as transações na aba principal de receitas/despesas, (2) criar ou atualizar uma aba "DRE" com os três demonstrativos, e (3) criar ou atualizar uma aba "Dashboard" com tabelas de dados para visualização.

## Process

1. **Estruturar os dados de lançamentos**: converter transações do JSON de Fernando para arrays JavaScript que o script vai inserir na planilha.

2. **Gerar função de lançamento na aba principal**: criar função `lancaTransacoes()` que localiza a aba de receitas/despesas existente da usuária, encontra a última linha preenchida e adiciona as transações do período. Cada linha: Data | Descrição | Categoria | Tipo | Valor | Área.

3. **Gerar função de DRE**: criar função `atualizaDRE()` que cria ou limpa uma aba chamada "DRE" e preenche os três demonstrativos (Agência / Cursos / Consolidado) com formatação: células de total em negrito, valores negativos em vermelho, percentuais calculados.

4. **Gerar função de dados do Dashboard**: criar função `atualizaDashboard()` que cria ou limpa uma aba "Dashboard" e preenche tabelas de dados com os principais indicadores (receitas por área, despesas por categoria, margens, comparativo). Nota: as tabelas fornecem dados brutos — a visualização gráfica avançada é gerada pelo Victor Visual em HTML.

5. **Gerar função master e instrucoes**: criar função `executarTudo()` que chama as três funções em sequência. Incluir ao início do script uma instrução de configuração com as variáveis que a usuária precisa ajustar (nome das abas, ID da planilha se necessário).

6. **Adicionar comentários em português em todo o script**: cada bloco, cada função e cada variável configurável deve ter um comentário explicativo.

## Output Format

```javascript
/**
 * ================================================
 * SQUAD FINANCEIRO PESSOAL — Google Apps Script
 * Período: {MÊS} {ANO}
 * Gerado em: {DATA}
 * ================================================
 *
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets
 * 2. Clique em Extensões > Apps Script
 * 3. Cole todo este código no editor
 * 4. Ajuste as variáveis da seção CONFIGURAÇÃO abaixo
 * 5. Clique em Executar > executarTudo
 * 6. Autorize o script quando solicitado
 */

// ============================================
// CONFIGURAÇÃO — ajuste antes de executar
// ============================================
var NOME_ABA_LANCAMENTOS = "Receitas e Despesas"; // Nome da sua aba principal
var NOME_ABA_DRE = "DRE";             // Será criada automaticamente
var NOME_ABA_DASHBOARD = "Dashboard"; // Será criada automaticamente

// ============================================
// DADOS DO PERÍODO {MÊS} {ANO}
// ============================================
var LANCAMENTOS_AGENCIA = [
  // [Data, Descrição, Categoria, Tipo, Valor, Área]
  // ...dados inseridos automaticamente...
];

var LANCAMENTOS_CURSOS = [
  // ...
];

// ... resto do script
```

## Output Example

```javascript
/**
 * ================================================
 * SQUAD FINANCEIRO PESSOAL — Google Apps Script
 * Período: Março 2026
 * Gerado em: 2026-04-20
 * ================================================
 *
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets
 * 2. Clique em Extensões > Apps Script
 * 3. Cole todo este código no editor
 * 4. Ajuste as variáveis na seção CONFIGURAÇÃO abaixo
 * 5. Clique em Executar > executarTudo
 * 6. Na primeira execução, autorize o acesso quando solicitado
 * 7. Aguarde a mensagem "Concluído!" na barra inferior
 */

// ============================================
// CONFIGURAÇÃO — ajuste antes de executar
// ============================================
var NOME_ABA_LANCAMENTOS = "Receitas e Despesas"; // Nome da sua aba de lançamentos atual
var NOME_ABA_DRE = "DRE";             // Nome da aba DRE (criada automaticamente se não existir)
var NOME_ABA_DASHBOARD = "Dashboard"; // Nome da aba Dashboard (criada automaticamente)

// ============================================
// DADOS — Março 2026
// Estes dados foram extraídos dos seus documentos pelo Fernando Fichador
// ============================================
var LANCAMENTOS_AGENCIA = [
  ["05/03/2026", "TED RECEBIDA - CLIENTE ALFA LTDA", "Receita de Serviço", "Receita", 3500.00, "Agência Fortecor"],
  ["10/03/2026", "PAGAMENTO FREELANCER DESIGN", "Despesa Operacional", "Despesa", -800.00, "Agência Fortecor"],
  ["15/03/2026", "TED RECEBIDA - EMPRESA BETA ME", "Receita de Serviço", "Receita", 2200.00, "Agência Fortecor"],
  ["20/03/2026", "DAS SIMPLES NACIONAL", "Imposto", "Despesa", -420.00, "Agência Fortecor"]
];

var LANCAMENTOS_CURSOS = [
  ["01/03/2026", "HOTMART - Venda Workshop Claude (bruto)", "Receita de Produto Digital", "Receita", 497.00, "Cursos e Assinatura"],
  ["01/03/2026", "HOTMART - Taxa de plataforma (10%)", "Despesa de Plataforma/Taxa", "Despesa", -49.70, "Cursos e Assinatura"],
  ["08/03/2026", "KIWIFY - Assinatura Clube IA (bruto)", "Receita de Assinatura", "Receita", 97.00, "Cursos e Assinatura"],
  ["08/03/2026", "KIWIFY - Taxa de plataforma (10%)", "Despesa de Plataforma/Taxa", "Despesa", -9.70, "Cursos e Assinatura"]
];

// ============================================
// FUNÇÃO PRINCIPAL — executa tudo em sequência
// ============================================
function executarTudo() {
  lancaTransacoes();
  atualizaDRE();
  atualizaDashboard();
  SpreadsheetApp.getUi().alert("✅ Concluído! Planilha atualizada com os dados de Março 2026.");
}

// ============================================
// FUNÇÃO 1: Lança transações na aba principal
// ============================================
function lancaTransacoes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(NOME_ABA_LANCAMENTOS);
  
  // Verifica se a aba existe
  if (!aba) {
    SpreadsheetApp.getUi().alert("⚠️ Aba '" + NOME_ABA_LANCAMENTOS + "' não encontrada. Verifique o nome na seção CONFIGURAÇÃO.");
    return;
  }
  
  // Encontra a última linha preenchida e adiciona após ela
  var ultimaLinha = aba.getLastRow() + 1;
  
  // Junta os lançamentos das duas áreas
  var todosLancamentos = LANCAMENTOS_AGENCIA.concat(LANCAMENTOS_CURSOS);
  
  // Insere os dados na planilha
  aba.getRange(ultimaLinha, 1, todosLancamentos.length, 6).setValues(todosLancamentos);
  
  // Formata valores negativos (despesas) em vermelho
  for (var i = 0; i < todosLancamentos.length; i++) {
    if (todosLancamentos[i][4] < 0) {
      aba.getRange(ultimaLinha + i, 5).setFontColor("#CC0000");
    }
  }
  
  Logger.log("✅ " + todosLancamentos.length + " lançamentos inseridos na aba de lançamentos.");
}

// ============================================
// FUNÇÃO 2: Cria/atualiza aba de DRE
// ============================================
function atualizaDRE() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(NOME_ABA_DRE);
  
  // Cria a aba se não existir
  if (!aba) {
    aba = ss.insertSheet(NOME_ABA_DRE);
  } else {
    aba.clearContents(); // Limpa para reescrever com dados atualizados
  }
  
  // Cabeçalho
  aba.getRange("A1").setValue("DRE — Março 2026 | Regime de Caixa").setFontWeight("bold").setFontSize(14);
  
  // DRE Agência Fortecor
  var linhaAtual = 3;
  aba.getRange(linhaAtual, 1).setValue("📊 AGÊNCIA FORTECOR").setFontWeight("bold").setBackground("#E8F4FD");
  linhaAtual++;
  
  var dreAgencia = [
    ["Receita Bruta", 5700.00, ""],
    ["(-) Deduções e Impostos", -420.00, ""],
    ["(=) Receita Líquida", 5280.00, "100,0%"],
    ["(-) CPV — Custo do Produto/Serviço", 0.00, "0,0%"],
    ["(=) Lucro Bruto", 5280.00, "100,0%"],
    ["(-) Despesas Operacionais", -800.00, "15,2%"],
    ["(=) EBITDA", 4480.00, "84,8%"],
    ["(=) Lucro Líquido", 4480.00, "84,8%"]
  ];
  
  aba.getRange(linhaAtual, 1, dreAgencia.length, 3).setValues(dreAgencia);
  
  // Formata totais em negrito
  [linhaAtual+2, linhaAtual+4, linhaAtual+6, linhaAtual+7].forEach(function(l) {
    aba.getRange(l, 1, 1, 3).setFontWeight("bold");
  });
  
  Logger.log("✅ Aba DRE atualizada.");
}

// ============================================
// FUNÇÃO 3: Cria/atualiza aba de Dashboard
// (tabelas de dados — visualização em HTML gerada pelo Victor Visual)
// ============================================
function atualizaDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(NOME_ABA_DASHBOARD);
  
  if (!aba) {
    aba = ss.insertSheet(NOME_ABA_DASHBOARD);
  } else {
    aba.clearContents();
  }
  
  aba.getRange("A1").setValue("📈 Dashboard Financeiro — Março 2026").setFontWeight("bold").setFontSize(14);
  
  // Tabela de indicadores por área
  var indicadores = [
    ["Área", "Receita Líquida", "Lucro Líquido", "Margem Líquida", "Status"],
    ["Agência Fortecor", "R$ 5.280,00", "R$ 4.480,00", "84,8%", "✅ Saudável"],
    ["Cursos e Assinatura", "R$ 534,60", "R$ 534,60", "100,0%", "✅ Saudável"],
    ["CONSOLIDADO", "R$ 5.814,60", "R$ 5.014,60", "86,2%", "✅ Saudável"]
  ];
  
  aba.getRange(3, 1, indicadores.length, 5).setValues(indicadores);
  aba.getRange(3, 1, 1, 5).setFontWeight("bold").setBackground("#F0F0F0");
  
  Logger.log("✅ Aba Dashboard atualizada.");
}
```

## Quality Criteria

- [ ] Script inclui seção CONFIGURAÇÃO com variáveis claramente nomeadas
- [ ] Todas as transações de Fernando estão nos arrays JavaScript do script
- [ ] Funções `lancaTransacoes()`, `atualizaDRE()` e `atualizaDashboard()` implementadas
- [ ] Função `executarTudo()` chama as três em sequência
- [ ] Todos os valores do DRE no script batem com os DREs gerados na task anterior
- [ ] Instruções de uso em português incluídas no cabeçalho do script

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. Valores nos arrays JavaScript diferem dos valores nos DREs gerados na task anterior (inconsistência)
2. Script contém erros de sintaxe JavaScript que impediriam sua execução
