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
git clone https://github.com/amandadinizmkt/sistema-financeiro-aula.git
cd sistema-financeiro-aula
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
Quero configurar este projeto. Faça tudo isso para mim, na ordem:

1. Crie um novo projeto Supabase chamado "sistema-financeiro-[meu-nome]" na região mais próxima do Brasil (us-east-1 ou sa-east-1).

2. Quando o projeto estiver pronto, pegue a URL e a publishable key.

3. Crie o arquivo .env.local na raiz deste projeto com:
NEXT_PUBLIC_SUPABASE_URL=<a URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<a chave>

4. Aplique a migração SQL que está em supabase/migrations/init.sql neste novo projeto Supabase.

5. Configure as URLs de auth no Supabase (Site URL: http://localhost:3000 e Redirect URLs: http://localhost:3000/**).

6. Desative confirmação de email para uso local.

7. Copie a pasta squad/ deste projeto para ~/squads/squad-financeiro-aula/ (assim o OpenSQUAD vai encontrar o squad quando eu rodar). Cria a pasta ~/squads/squad-financeiro-aula/output/ vazia também se ela não existir.

8. Copie o arquivo config/sistema.example.json para config/sistema.json. Já preenche o squad_output_path com "/Users/[meu-usuario]/squads/squad-financeiro-aula/output" (substituindo [meu-usuario] pelo meu usuário real). Me pergunte só o nome das minhas duas verticais (agência e cursos/marketing) para preencher os outros campos.

9. Quando terminar, me diga o que devo fazer em seguida.
```

O Claude Code vai fazer **todo o setup técnico sozinho**. Você só precisa responder 2 perguntas:

- Qual o nome do seu projeto?
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
1. Coloque seus extratos e prints do mês numa pasta qualquer
2. Abra o Claude Code dentro da pasta deste projeto e rode:
   ```
   /opensquad → run squad-financeiro-pessoal
   ```
   (o squad já está incluído neste projeto, em `squad/`)
3. Aguarde o squad rodar (~10 min)
4. No sistema, clique em **🔄 Extrair do Squad** → carrega tudo automaticamente

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
