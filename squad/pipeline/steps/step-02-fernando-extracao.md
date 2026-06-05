---
execution: subagent
agent: fernando
inputFile: squads/squad-financeiro-pessoal/output/contexto-periodo.md
outputFile: squads/squad-financeiro-pessoal/output/transacoes-extraidas.json
model_tier: powerful
---

# Step 02: Fernando Fichador — Extração e Categorização

## Context Loading

Carregar antes de executar:
- `squads/squad-financeiro-pessoal/output/{run_id}/contexto-periodo.md` — período de referência, instruções de categorização e lista de documentos enviados pela usuária
- `squads/squad-financeiro-pessoal/agents/fernando.agent.md` — persona e princípios do Fernando
- `squads/squad-financeiro-pessoal/agents/fernando/tasks/extract-transactions.md` — processo detalhado de extração
- `squads/squad-financeiro-pessoal/pipeline/data/domain-framework.md` — framework financeiro de referência
- Todos os arquivos de documentos financeiros enviados pela usuária (PDFs, imagens)

## Instructions

### Process

1. **Ler o contexto-periodo.md** para identificar: período de referência, conta da Agência (X), conta dos Cursos (Y), instruções especiais de categorização e transferências internas declaradas.

2. **Processar cada documento** seguindo o processo da task `extract-transactions.md`:
   - Extrair todos os lançamentos com: data, descrição original, valor, tipo (crédito/débito), origem (banco/plataforma)
   - Para plataformas digitais (Hotmart, Kiwify, Stripe): separar receita bruta e taxa da plataforma como dois lançamentos distintos
   - Identificar a área por conta bancária de origem

3. **Detectar e remover duplicatas**: comparar lançamentos de diferentes documentos buscando: mesma data + mesmo valor + descrição similar. Consolidar em um único registro com nota.

4. **Categorizar cada lançamento** usando as categorias padrão:
   - Receita de Serviço (Agência) | Receita de Produto Digital (Cursos) | Receita de Assinatura
   - Despesa Operacional | Despesa de Plataforma/Taxa | Despesa com Pessoal | Imposto | Transferência Interna

5. **Compilar JSON de saída** com todos os lançamentos estruturados, totais por área e lista de pendências. Salvar em `output/{run_id}/transacoes-extraidas.json`.

## Output Format

```json
{
  "periodo": "YYYY-MM",
  "documentos_processados": ["arquivo1.pdf", "arquivo2.png"],
  "agencia": {
    "lancamentos": [
      {
        "data": "YYYY-MM-DD",
        "descricao": "Descrição original",
        "categoria": "Receita de Serviço",
        "tipo": "receita",
        "valor": 0.00,
        "nota": null
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
      "arquivo": "nome_arquivo",
      "descricao": "o que foi encontrado",
      "problema": "motivo da pendência",
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
        "descricao": "HOTMART - Workshop Claude (bruto)",
        "categoria": "Receita de Produto Digital",
        "tipo": "receita",
        "valor": 497.00,
        "nota": null
      },
      {
        "data": "2026-03-01",
        "descricao": "HOTMART - Taxa de plataforma 10%",
        "categoria": "Despesa de Plataforma/Taxa",
        "tipo": "despesa",
        "valor": -49.70,
        "nota": "Taxa Hotmart"
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
      "descricao": "PIX RECEBIDO sem identificação do pagador",
      "problema": "Não foi possível determinar se é Agência ou Cursos",
      "valor_aproximado": 250.00
    }
  ],
  "resumo": {
    "total_lancamentos": 5,
    "lancamentos_agencia": 3,
    "lancamentos_cursos": 2,
    "pendencias": 1,
    "duplicatas_removidas": 0
  }
}
```

## Veto Conditions

Rejeitar e refazer se QUALQUER uma destas for verdade:
1. `saldo_liquido` de qualquer área não bate com a soma algébrica dos `valor` dos lançamentos daquela área
2. Um mesmo lançamento (mesma data + valor + descrição similar) aparece duplicado no output

## Quality Criteria

- [ ] Todos os documentos listados em `documentos_processados` foram processados
- [ ] Todas as receitas têm valor positivo; todas as despesas têm valor negativo
- [ ] Taxas de plataforma lançadas como despesa separada da receita bruta
- [ ] Pendências listadas com descrição clara do problema
- [ ] Totais calculados corretamente por área
