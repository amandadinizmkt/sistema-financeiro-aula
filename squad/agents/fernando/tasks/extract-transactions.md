---
task: "Extração e Categorização de Transações"
order: 1
input: |
  - arquivos: PDFs de extrato bancário e/ou prints de plataformas de pagamento
  - periodo: mês/ano de referência informado pela usuária
  - areas: definição das duas áreas (Agência Fortecor = conta X; Cursos/Assinatura = conta Y)
output: |
  - transacoes_agencia: lista estruturada de lançamentos da Agência
  - transacoes_cursos: lista estruturada de lançamentos de Cursos/Assinatura
  - pendencias: lançamentos que precisam de confirmação
  - resumo: totais por área e tipo
---

# Extração e Categorização de Transações

Lê todos os documentos financeiros brutos fornecidos, extrai cada transação individualmente, remove duplicatas, classifica por tipo (receita/despesa) e atribui à área correta do negócio (Agência Fortecor ou Cursos/Assinatura).

## Process

1. **Inventariar documentos recebidos**: listar cada arquivo com nome, formato (PDF/imagem), e identificar de qual plataforma ou banco veio (Bradesco, Nubank, Hotmart, Kiwify, Stripe, etc.)

2. **Extrair lançamentos por documento**: para cada arquivo, extrair cada transação com os campos: data, descrição original, valor bruto, tipo (crédito/débito), e plataforma de origem. Para plataformas como Hotmart/Kiwify, extrair separadamente: valor bruto da venda, taxa da plataforma e valor líquido recebido.

3. **Identificar e remover duplicatas**: comparar todos os lançamentos extraídos buscando mesma data + mesmo valor + descrição similar. Quando encontrar duplicata, manter um único registro e adicionar nota "consolidado de X documentos".

4. **Atribuir área por conta de origem**: Agência Fortecor = conta bancária X / Cursos e Assinatura = conta bancária Y. Para plataformas (Hotmart, Kiwify), verificar qual conta de destino está cadastrada. Se não identificável, marcar como "Indefinido — confirmar".

5. **Categorizar por natureza**: classificar cada lançamento em uma das categorias: Receita de Serviço (Agência), Receita de Produto Digital (Cursos), Receita de Assinatura, Despesa Operacional, Despesa de Plataforma/Taxa, Despesa com Pessoal, Imposto, Transferência Interna, Estorno. Adicionar nota quando a categorização for por inferência.

6. **Compilar e calcular totais**: organizar os lançamentos em duas tabelas separadas (Agência / Cursos) ordenadas por data. Calcular totais de receita bruta, total de despesas e saldo líquido por área. Listar pendências separadamente.

## Output Format

```json
{
  "periodo": "YYYY-MM",
  "documentos_processados": ["arquivo1.pdf", "print_hotmart.png"],
  "agencia": {
    "lancamentos": [
      {
        "data": "YYYY-MM-DD",
        "descricao": "Descrição original do documento",
        "categoria": "Receita de Serviço",
        "tipo": "receita",
        "valor": 0.00,
        "nota": "opcional — explica inferências"
      }
    ],
    "totais": {
      "receita_bruta": 0.00,
      "despesas": 0.00,
      "saldo_liquido": 0.00
    }
  },
  "cursos": {
    "lancamentos": [...],
    "totais": {...}
  },
  "pendencias": [
    {
      "arquivo": "nome_do_arquivo",
      "descricao": "o que foi encontrado",
      "problema": "por que não foi possível categorizar",
      "valor_aproximado": 0.00
    }
  ],
  "resumo": {
    "total_lancamentos": 0,
    "lancamentos_agencia": 0,
    "lancamentos_cursos": 0,
    "pendencias": 0,
    "duplicatas_removidas": 0
  }
}
```

## Output Example

```json
{
  "periodo": "2026-03",
  "documentos_processados": [
    "extrato_bradesco_marco.pdf",
    "extrato_nubank_marco.pdf",
    "hotmart_vendas_marco.png",
    "kiwify_assinaturas_marco.png"
  ],
  "agencia": {
    "lancamentos": [
      {
        "data": "2026-03-05",
        "descricao": "TED RECEBIDA - CLIENTE ALFA LTDA",
        "categoria": "Receita de Serviço",
        "tipo": "receita",
        "valor": 3500.00,
        "nota": null
      },
      {
        "data": "2026-03-10",
        "descricao": "PAGAMENTO FREELANCER DESIGN",
        "categoria": "Despesa Operacional",
        "tipo": "despesa",
        "valor": -800.00,
        "nota": null
      },
      {
        "data": "2026-03-15",
        "descricao": "TED RECEBIDA - EMPRESA BETA ME",
        "categoria": "Receita de Serviço",
        "tipo": "receita",
        "valor": 2200.00,
        "nota": null
      },
      {
        "data": "2026-03-20",
        "descricao": "DAS SIMPLES NACIONAL",
        "categoria": "Imposto",
        "tipo": "despesa",
        "valor": -420.00,
        "nota": null
      }
    ],
    "totais": {
      "receita_bruta": 5700.00,
      "despesas": -1220.00,
      "saldo_liquido": 4480.00
    }
  },
  "cursos": {
    "lancamentos": [
      {
        "data": "2026-03-01",
        "descricao": "HOTMART - Venda Workshop Claude (bruto)",
        "categoria": "Receita de Produto Digital",
        "tipo": "receita",
        "valor": 497.00,
        "nota": null
      },
      {
        "data": "2026-03-01",
        "descricao": "HOTMART - Taxa de plataforma",
        "categoria": "Despesa de Plataforma/Taxa",
        "tipo": "despesa",
        "valor": -49.70,
        "nota": "Taxa Hotmart 10%"
      },
      {
        "data": "2026-03-08",
        "descricao": "KIWIFY - Assinatura Clube IA (bruto)",
        "categoria": "Receita de Assinatura",
        "tipo": "receita",
        "valor": 97.00,
        "nota": null
      },
      {
        "data": "2026-03-08",
        "descricao": "KIWIFY - Taxa de plataforma",
        "categoria": "Despesa de Plataforma/Taxa",
        "tipo": "despesa",
        "valor": -9.70,
        "nota": "Taxa Kiwify 10%"
      }
    ],
    "totais": {
      "receita_bruta": 594.00,
      "despesas": -59.40,
      "saldo_liquido": 534.60
    }
  },
  "pendencias": [
    {
      "arquivo": "extrato_bradesco_marco.pdf",
      "descricao": "PIX RECEBIDO - 250,00 - sem identificação do pagador",
      "problema": "Pagador não identificado — pode ser Agência ou Cursos",
      "valor_aproximado": 250.00
    }
  ],
  "resumo": {
    "total_lancamentos": 9,
    "lancamentos_agencia": 4,
    "lancamentos_cursos": 4,
    "pendencias": 1,
    "duplicatas_removidas": 0
  }
}
```

## Quality Criteria

- [ ] Todos os arquivos listados em "documentos_processados" foram de fato processados
- [ ] Nenhum lançamento tem campo `data`, `valor` ou `tipo` em branco
- [ ] Todas as receitas têm valor positivo; todas as despesas têm valor negativo
- [ ] Taxas de plataforma (Hotmart, Kiwify, Stripe) lançadas separadamente da receita bruta
- [ ] Pendências listadas com descrição do problema — nenhuma transação ambígua silenciada
- [ ] Totais de cada área batem com a soma dos lançamentos individuais

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. Total de "saldo_liquido" não bate com a soma algébrica dos lançamentos (erro matemático)
2. Um mesmo lançamento (mesma data + valor + descrição similar) aparece duplicado na saída final
