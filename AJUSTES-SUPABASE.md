# Ajustes Manuais no Supabase Dashboard

Estes 2 ajustes precisam ser feitos uma vez no Supabase dashboard. **Leva 1 minuto.**

---

## 1. URL Configuration (segurança contra phishing)

Acesse: **Authentication → URL Configuration**

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (adicione):**
```
http://localhost:3000/**
http://localhost:3001/**
```

> Por quê? Quando o Supabase envia email de confirmação/reset de senha, ele só aceita redirecionar para URLs nesta lista. Sem isso, qualquer site externo poderia interceptar fluxos de auth.

---

## 2. Email Confirmation (decisão de UX)

Acesse: **Authentication → Sign In / Providers → Email**

Você tem 2 opções:

### Opção A — Desativar confirmação (mais simples para uso local)
- Desmarque **"Confirm email"**
- Aluna cria conta e já entra direto, sem precisar checar email
- **Recomendado para a aula** — evita travar a aluna esperando email chegar

### Opção B — Manter confirmação (mais seguro)
- Mantém marcado **"Confirm email"**
- Aluna precisa clicar no link do email para confirmar antes de entrar
- Use se for hospedar o sistema publicamente algum dia

---

## 3. Rate Limiting (opcional, mas recomendado)

Acesse: **Authentication → Rate Limits**

Configurações padrão já são razoáveis. Se quiser ser mais restritivo:
- **Sign in attempts:** 5 por 5 minutos (padrão é 30)
- **Sign up attempts:** 3 por hora (padrão é 30)

> Evita ataques de força bruta no login.

---

## Pronto!

Depois desses 3 ajustes, seu Supabase está pronto. As alunas vão fazer os mesmos ajustes no projeto delas via Claude Code automaticamente (não precisam abrir o dashboard).
