# Setup do Sistema Financeiro

Guia rápido para colocar o sistema rodando na sua máquina.
**Tempo total: ~5 minutos.**

---

## Pré-requisitos

Antes de começar, confira se você tem:

- [ ] **Node.js 20+** instalado ([baixar aqui](https://nodejs.org))
- [ ] **Claude Code** instalado (você já tem se viu a aula do OpenSQUAD)
- [ ] **Conta no Supabase** (cria na hora se ainda não tem — é grátis)

---

## Passo 1 — Conectar o Supabase ao Claude Code (uma vez só)

Isso vale pra sempre. Faz uma vez e nunca mais precisa.

1. Vá em **[claude.ai](https://claude.ai)** e faça login
2. Clique no seu avatar → **Settings → Connectors**
3. Encontre **Supabase** na lista e clique em **Connect**
4. Faça login no Supabase (cria conta grátis na hora se não tiver)
5. Aprovar acesso

Pronto. Agora o Claude Code consegue criar projetos Supabase e configurar tudo sozinho.

---

## Passo 2 — Clonar o sistema

No terminal:

```bash
git clone https://github.com/amandadinizmkt/sistema-financeiro-aula.git
cd sistema-financeiro-aula
npm install
```

---

## Passo 3 — Pedir pro Claude Code fazer o setup

Ainda dentro da pasta do projeto, abre o Claude Code:

```bash
claude
```

E digita esta única frase:

> **Faça o setup deste projeto seguindo todas as instruções da seção "Instruções para o Claude Code" do SETUP.md**

Pronto. O Claude Code lê este arquivo, executa todas as etapas técnicas sozinho e te faz **2 perguntas em português:**

1. Qual o nome do seu projeto? (sugere "sistema-financeiro-[seu-nome]")
2. Qual o nome da sua agência (vertical 1) e da segunda vertical (cursos, mentorias, marketing)?

Responde direto e ele continua.

---

## Passo 4 — Rodar o sistema

Quando o Claude terminar, no terminal:

```bash
npm run dev
```

Abre o navegador em **http://localhost:3000** → clica em "Primeiro acesso? Criar conta" → cria com email e senha → e pronto, tá rodando.

---

## Passo 5 — Fechar seu primeiro mês com o squad

Veja a seção **"Como fechar um mês com o squad"** mais abaixo.

---

# Instruções para o Claude Code

> Esta seção é para o Claude Code ler quando a aluna pedir o setup. Execute todas as etapas abaixo, na ordem.

## 1. Criar o projeto Supabase

Use o MCP do Supabase para criar um novo projeto.

- Nome: pergunte à usuária qual nome ela quer (sugira `sistema-financeiro-[primeiro-nome]`)
- Região: us-east-1 ou sa-east-1 (a mais próxima do Brasil)
- Aguarde até o status do projeto ficar `ACTIVE_HEALTHY` antes de continuar

## 2. Pegar a URL e a publishable key

Use as ferramentas do MCP do Supabase para obter:
- A URL do projeto
- A publishable key (anon key)

## 3. Criar o arquivo .env.local

Crie na raiz do projeto um arquivo `.env.local` com:

```
NEXT_PUBLIC_SUPABASE_URL=<URL_DO_PROJETO>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<PUBLISHABLE_KEY>
```

## 4. Aplicar a migração SQL

Aplique o arquivo `supabase/migrations/init.sql` no banco recém-criado (use o MCP do Supabase: `apply_migration` com o conteúdo do arquivo).

Isso cria as 4 tabelas necessárias com Row Level Security ativado.

## 5. Configurar URLs de auth no Supabase

No dashboard do Supabase do novo projeto:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/**`

Se houver ferramenta MCP para isso, use. Senão, peça pra usuária fazer manualmente em https://supabase.com/dashboard/project/[PROJECT_ID]/auth/url-configuration e mostre o link exato.

## 6. Desativar confirmação de email

No dashboard do Supabase:
- Auth → Sign In / Providers → Email
- Desligue o toggle **"Confirm email"**

Se houver ferramenta MCP para isso, use. Senão, peça à usuária pra fazer manualmente e mostre o link exato.

## 7. Copiar o squad para ~/squads/squad-financeiro-aula/

O OpenSQUAD procura squads em `~/squads/{nome-do-squad}/`. Como o squad está dentro do projeto em `./squad/`, copie ele para o caminho canônico:

```bash
mkdir -p ~/squads/squad-financeiro-aula
cp -r ./squad/* ~/squads/squad-financeiro-aula/
mkdir -p ~/squads/squad-financeiro-aula/output
```

## 8. Criar o config/sistema.json

Copie `config/sistema.example.json` para `config/sistema.json` e preencha:

- `squad_output_path`: `/Users/[USUARIO]/squads/squad-financeiro-aula/output` (descubra o usuário real via `$HOME` ou `process.env.USER`)
- `pf_imports_path`: `./pf-imports`
- `empresas.agencia` e `empresas.cursos`: **pergunte à usuária** quais são as duas verticais do negócio dela. Exemplos:
  - Agência de marketing → "Minha Agência" + "Tráfego pago"
  - Infoproduto → "Cursos" + "Mentorias"
  - Coach → "Mentorias 1:1" + "Cursos em grupo"

## 9. Confirmar pra usuária

Quando terminar tudo, diga à usuária:

> ✅ Setup completo! Agora roda `npm run dev` no terminal e abre http://localhost:3000. Cria sua conta com email e senha — você vai entrar direto.

---

# Como fechar um mês com o squad

Depois que o setup tá feito, todo mês você repete este fluxo:

## 1. Junte seus dados do mês numa pasta

Crie uma pasta onde quiser na sua máquina e jogue lá os prints, PDFs e CSVs do mês:

```bash
mkdir -p ~/meu-financeiro/junho-2026
# joga todos os arquivos lá
```

Pode misturar formatos — o Fernando aceita tudo.

## 2. Rode o OpenSQUAD

No terminal:

```bash
cd ~/squads/squad-financeiro-aula
claude
```

Dentro do Claude Code:

```
/opensquad
```

Escolha **run** → **squad-financeiro-aula**.

## 3. Responda o Step 1 (Upload)

O squad vai pedir:
- Período de referência (ex: "Junho 2026")
- Caminho da pasta com os arquivos
- Qual conta/plataforma é cada arquivo (Banco X conta da Agência, Hotmart é Cursos, etc.)
- Instruções de categorização específicas (taxa de plataforma, freelancers, impostos, etc.)
- Se há transferências internas entre as áreas

Cole essas infos e o squad começa.

## 4. Acompanhe e aprove nos checkpoints

Fernando lê e extrai → você revisa → Diana monta DRE → Victor gera dashboard → você revisa → Renata audita. Tempo total ~10 minutos.

Em cada checkpoint, responde **"Aprovado"** se tudo tá certo.

## 5. Sincronize com o sistema

Volta no navegador em `http://localhost:3000/pj` e clica em **🔄 Extrair do Squad**.

Os dados do mês aparecem com nomes das suas verticais, lançamentos, KPIs, DRE renderizado e dashboard.

## 6. Conta PF (opcional)

Pra subir seus gastos pessoais:

1. Joga prints/CSVs em `pf-imports/` (pasta dentro do projeto)
2. Abre Claude Code na pasta do projeto e digita:
   ```
   processar imports PF e subir pro sistema
   ```
3. Recarrega `/pf` no navegador
