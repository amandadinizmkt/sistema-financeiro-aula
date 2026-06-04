# Setup do Sistema Financeiro

Guia rápido para colocar o sistema rodando na sua máquina.
**Tempo total: ~5 minutos.**

---

## Pré-requisitos

Antes de começar, confira se você tem:

- [ ] **Node.js 20+** instalado ([baixar aqui](https://nodejs.org))
- [ ] **Claude Code** instalado (você já tem se viu a aula do OpenSQUAD)
- [ ] **Conta no Supabase** (vamos criar agora se você ainda não tem)

---

## Passo 1 — Conectar o Supabase ao Claude Code

Isso é feito **uma vez só** e serve para todos os projetos futuros.

1. Vá em **[claude.ai](https://claude.ai)** e faça login
2. Clique no seu avatar → **Settings → Connectors**
3. Encontre **Supabase** na lista e clique em **Connect**
4. Faça login no Supabase (ou crie conta na hora, é grátis)
5. Aprovar acesso

Pronto. O Claude Code agora consegue criar projetos, tabelas e configurar tudo no Supabase sozinho.

---

## Passo 2 — Clonar o sistema

Abre o terminal e roda:

```bash
git clone https://github.com/amandadiniz/sistema-financeiro.git
cd sistema-financeiro
npm install
```

---

## Passo 3 — Abrir Claude Code e rodar o setup automático

Ainda no terminal, dentro da pasta:

```bash
claude
```

Quando o Claude Code abrir, **cole exatamente este prompt** (com Ctrl+V / Cmd+V):

```
Quero configurar este projeto. Faça tudo isso para mim:

1. Crie um novo projeto Supabase chamado "sistema-financeiro-[meu-nome]" na região mais próxima do Brasil (us-east-1 ou sa-east-1).

2. Quando o projeto estiver pronto, pegue a URL e a publishable key.

3. Crie o arquivo .env.local na raiz deste projeto com:
NEXT_PUBLIC_SUPABASE_URL=<a URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<a chave>

4. Aplique a migração SQL que está em supabase/migrations/init.sql neste novo projeto Supabase.

5. Configure as URLs de auth (Site URL: http://localhost:3000 e Redirect URLs: http://localhost:3000/**).

6. Desative confirmação de email para uso local.

7. Copie o arquivo config/sistema.example.json para config/sistema.json. Me pergunte qual o caminho da pasta do squad financeiro pessoal e o nome das minhas duas verticais (agência e cursos/marketing) para preencher o sistema.json.

8. Quando terminar, me diga o que devo fazer em seguida.
```

O Claude Code vai fazer **todo o setup técnico sozinho**. Você só precisa responder as 3 perguntas que ele fizer:

- Qual o nome do seu projeto?
- Qual o caminho da pasta do squad financeiro pessoal?
- Qual o nome da sua agência e da segunda vertical (cursos, mentorias, marketing)?

---

## Passo 4 — Rodar o sistema

Ainda no terminal:

```bash
npm run dev
```

Abre o navegador em **http://localhost:3000** → clica em "Primeiro acesso? Criar conta" → cria sua conta com email e senha → e pronto.

---

## Passo 5 — Carregar seus dados

Tem 2 jeitos de colocar dados no sistema:

### Para Conta PJ:
1. Rode o squad financeiro pessoal no mês que você quer
2. No sistema, clique em **🔄 Extrair do Squad** → carrega tudo automaticamente

### Para Conta PF:
1. Coloca prints de extrato ou CSVs na pasta `pf-imports/`
2. No Claude Code, na pasta do projeto, digita:
   ```
   processar imports PF e subir pro sistema
   ```
3. O Claude lê os arquivos, extrai os lançamentos e salva no Supabase

---

## Problemas comuns

### "Não consigo logar"
Se você criou conta e está dando erro, verifica se a confirmação de email está ativa no Supabase (passo 3.6 acima). Se estiver, abre seu email e clica no link de confirmação.

### "Erro 500 ao clicar em Extrair do Squad"
Provavelmente o caminho do squad em `config/sistema.json` está errado. Abre o arquivo e confirma se o path aponta para a pasta `output/` do seu squad financeiro.

### "Página em branco"
Confirma que rodou `npm install` e que o `.env.local` existe na raiz com as 2 chaves do Supabase.

---

## Próximos passos opcionais

- **Deploy na Vercel** (acessar de qualquer lugar): conecta o GitHub na Vercel, importa esse repo, copia as 2 variáveis do `.env.local` na Vercel, deploy automático.
- **Acesso pelo celular** (depois do deploy): adiciona o link da Vercel à tela inicial do iPhone/Android, vira PWA.
- **Backup automático:** o Supabase faz backup diário grátis. Em **Database → Backups** você pode baixar quando quiser.

---

**Pronto!** Seu CFO automático está rodando. Qualquer dúvida, manda no canal do Clube Divos da IA.
