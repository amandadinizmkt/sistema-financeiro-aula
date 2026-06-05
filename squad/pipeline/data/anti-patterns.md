# Anti-Patterns — Squad Financeiro Pessoal

## Erros Críticos (Invalidam o Resultado)

### 1. Duplicar lançamentos de múltiplos documentos
**O que é:** processar o extrato bancário E o comprovante de pagamento do mesmo PIX/TED como dois lançamentos diferentes.
**Por que acontece:** o mesmo dinheiro aparece em dois documentos distintos (extrato + print da plataforma).
**Consequência:** DRE com receita inflada, auditoria matemática reprovada.
**Como evitar:** sempre verificar cruzamento data+valor+origem antes de finalizar a extração. Um pagamento = um lançamento, mesmo que apareça em vários documentos.

### 2. Misturar receita bruta com receita líquida das plataformas
**O que é:** registrar apenas o repasse que a Hotmart/Kiwify transfere para a conta (líquido após a taxa) como se fosse a receita total.
**Por que acontece:** o extrato bancário mostra o valor já descontado da taxa da plataforma.
**Consequência:** DRE subestima receita bruta e omite despesa real de plataforma. O CPV fica zerado indevidamente.
**Como evitar:** sempre consultar o relatório da plataforma (não apenas o extrato bancário) para obter o valor bruto da venda e a taxa cobrada separadamente.

### 3. Não eliminar transferências internas no DRE Consolidado
**O que é:** somar os DREs da Agência e de Cursos sem remover movimentações entre as duas contas (ex: Amanda transferiu R$1.000 da conta da agência para a conta dos cursos).
**Por que acontece:** a transferência aparece como despesa na Agência e como receita em Cursos.
**Consequência:** DRE Consolidado com receita e despesas infladas — a empresa parece maior e mais movimentada do que é.
**Como evitar:** identificar todos os lançamentos categorizados como "Transferência Interna" e zerá-los bilateralmente antes de consolidar.

### 4. Entregar diagnóstico com auditoria reprovada
**O que é:** produzir insights e recomendações mesmo quando os totais do DRE não batem com os lançamentos.
**Por que acontece:** pressa para entregar o relatório final sem verificar consistência.
**Consequência:** recomendações baseadas em dados incorretos. Amanda toma decisões erradas.
**Como evitar:** a Renata recalcula os totais independentemente. Se qualquer área divergir em > R$0,01, parar e reportar o erro antes de prosseguir.

### 5. Script Google Apps Script com dependências externas
**O que é:** gerar um script que chama funções de APIs externas ou carrega bibliotecas não disponíveis no ambiente Apps Script padrão.
**Por que acontece:** tentação de usar funcionalidades avançadas (Google Charts API, bibliotecas npm).
**Consequência:** script que parece funcionar mas falha na execução da usuária.
**Como evitar:** usar apenas APIs nativas do Google Apps Script (SpreadsheetApp, DriveApp). Verificar que todas as funções chamadas existem no ambiente padrão.

## Erros de Qualidade (Degradam o Resultado)

### 6. Classificar transação na área errada por conteúdo
**O que é:** classificar um lançamento como "Cursos" porque a descrição menciona "educação" quando na verdade veio da conta bancária da Agência.
**Critério correto:** a área é determinada pela conta bancária de origem, não pelo conteúdo da descrição.

### 7. Apresentar percentuais sem base de cálculo explícita
**O que é:** "Margem de 45%" sem especificar "45% da Receita Líquida".
**Consequência:** Amanda não sabe o que o percentual representa — pode confundir com % da Receita Bruta.
**Padrão correto:** sempre especificar "% da Receita Líquida" na coluna de percentuais do DRE.

### 8. Recomendações sem priorização
**O que é:** listar 5 sugestões com o mesmo peso visual sem indicar o que fazer primeiro.
**Consequência:** Amanda não sabe por onde começar — pode focar no menos importante.
**Padrão correto:** sempre ordenar por prioridade (Alta → Média → Baixa) e indicar explicitamente.

### 9. Dashboard HTML com dependências de CDN
**O que é:** usar `<script src="https://cdn.jsdelivr.net/npm/chart.js">` em vez de embutir o código inline.
**Consequência:** dashboard não abre quando Amanda está offline ou o CDN está lento.
**Padrão correto:** embutir o Chart.js minificado diretamente no HTML.

### 10. Insights vagos sem dados específicos
**O que é:** "As despesas estão altas" sem indicar qual categoria, qual valor e qual percentual.
**Padrão correto:** "A despesa com freelancers de R$800,00 representa 15,2% da receita líquida — dentro do limite saudável de 40%, mas dobrou em relação ao mês anterior."
