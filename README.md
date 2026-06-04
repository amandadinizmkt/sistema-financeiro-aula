# Sistema Financeiro — CFO Automático

Sistema web para gestão financeira pessoal e empresarial, integrado ao **Squad Financeiro Pessoal** (OpenSQUAD).

> Construído para o **Clube Divos da IA** — aula CFO Automático.

---

## O que o sistema faz

- **Conta PJ:** carrega automaticamente DRE, dashboard e lançamentos gerados pelo squad financeiro. Tabs separadas para cada vertical do negócio (ex: Agência + Cursos), DRE renderizado bonito, KPIs com semáforo, histórico de meses.
- **Conta PF:** processa prints e CSVs de extratos pessoais que você joga numa pasta, organiza por categoria, mostra entradas (pró-labore, distribuição de lucro) e saídas (gastos por categoria).
- **Multi-mês:** fecha um mês, arquiva no histórico, abre o próximo. Compara meses lado a lado.
- **Multi-usuário:** cada pessoa tem o próprio Supabase com Row Level Security. Dados isolados no nível do banco.

---

## Segurança

- Autenticação via Supabase Auth (email + senha)
- Row Level Security em todas as tabelas (usuário só vê os próprios dados)
- Headers de segurança (CSP, X-Frame-Options, Referrer-Policy)
- Validação de schema (Zod) em todas as rotas API
- Sanitização de HTML antes de qualquer renderização

---

## Setup

Veja o **[SETUP.md](./SETUP.md)** — leva 5 minutos com Claude Code.

Para ajustes manuais no Supabase, veja **[AJUSTES-SUPABASE.md](./AJUSTES-SUPABASE.md)**.

---

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript
- **Banco:** Supabase (Postgres + Auth + RLS)
- **Estilo:** CSS-in-JS (paleta Clube Divos da IA)
- **Validação:** Zod
- **Sanitização:** DOMPurify

---

## Comandos

```bash
npm run dev      # desenvolvimento (localhost:3000)

```bash
npm run dev      # desenvolvimento (localhost:3000)
npm run build    # build de produção
npm run start    # rodar build de produção
```

---

## Estrutura

```
sistema-financeiro/
├── src/
│   ├── app/                 # rotas Next.js (App Router)
│   │   ├── api/             # endpoints (validação Zod + auth obrigatória)
│   │   ├── login/           # tela de login/signup
│   │   ├── pj/              # Conta PJ
│   │   └── pf/              # Conta PF
│   ├── components/          # componentes React
│   ├── lib/
│   │   ├── supabase/        # client/server/db helpers
│   │   ├── data.ts          # leitura de configs (server-only)
│   │   ├── sync.ts          # leitura dos outputs do squad
│   │   └── types.ts         # tipos compartilhados
│   └── proxy.ts             # middleware de auth (Next.js 16)
├── supabase/
│   └── migrations/init.sql  # schema do banco
├── config/
│   └── sistema.example.json # exemplo de configuração local
├── pf-imports/              # você joga prints PF aqui
└── data/                    # dados locais (gitignored)
```

---

## Licença

Uso pessoal e educacional. Construído para alunas do Clube Divos da IA.
