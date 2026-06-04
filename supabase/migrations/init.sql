-- ============================================
-- Sistema Financeiro — Migração inicial
-- ============================================
-- Tabelas para gestão financeira PJ + PF
-- Row Level Security: cada usuário só acessa os próprios dados

-- ===== PJ — Períodos =====

CREATE TABLE IF NOT EXISTS public.fin_pj_periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes varchar(7) NOT NULL,
  periodo text,
  run_id text,
  ultimo_sync timestamptz,
  agencia_nome text DEFAULT 'Agência',
  agencia_receita_bruta numeric DEFAULT 0,
  agencia_receita_liquida numeric DEFAULT 0,
  agencia_despesas numeric DEFAULT 0,
  agencia_resultado numeric DEFAULT 0,
  agencia_distribuicao_lucro numeric DEFAULT 0,
  cursos_nome text DEFAULT 'Cursos / Marketing',
  cursos_receita_bruta numeric DEFAULT 0,
  cursos_receita_liquida numeric DEFAULT 0,
  cursos_despesas numeric DEFAULT 0,
  cursos_resultado numeric DEFAULT 0,
  dre_agencia text DEFAULT '',
  dre_cursos text DEFAULT '',
  dre_consolidado text DEFAULT '',
  pendencias jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mes)
);

-- ===== PJ — Lançamentos =====

CREATE TABLE IF NOT EXISTS public.fin_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes varchar(7) NOT NULL,
  empresa varchar(10) NOT NULL,
  data date NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  tipo varchar(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria text,
  nota text,
  is_manual boolean DEFAULT false,
  fonte text,
  created_at timestamptz DEFAULT now()
);

-- ===== PF — Períodos =====

CREATE TABLE IF NOT EXISTS public.fin_pf_periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes varchar(7) NOT NULL,
  periodo text,
  ultimo_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mes)
);

-- ===== PF — Lançamentos =====

CREATE TABLE IF NOT EXISTS public.fin_pf_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes varchar(7) NOT NULL,
  data date NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  tipo varchar(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria text,
  conta varchar(5) DEFAULT 'pf',
  nota text,
  is_manual boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Row Level Security (CRÍTICO — não remover)
-- ============================================
-- Sem essas políticas, qualquer usuário autenticado pode ler/modificar
-- dados de outros usuários

ALTER TABLE public.fin_pj_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_pf_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_pf_lancamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fin_pj_periodos_user_only" ON public.fin_pj_periodos;
DROP POLICY IF EXISTS "fin_lancamentos_user_only" ON public.fin_lancamentos;
DROP POLICY IF EXISTS "fin_pf_periodos_user_only" ON public.fin_pf_periodos;
DROP POLICY IF EXISTS "fin_pf_lancamentos_user_only" ON public.fin_pf_lancamentos;

CREATE POLICY "fin_pj_periodos_user_only" ON public.fin_pj_periodos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fin_lancamentos_user_only" ON public.fin_lancamentos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fin_pf_periodos_user_only" ON public.fin_pf_periodos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fin_pf_lancamentos_user_only" ON public.fin_pf_lancamentos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Trigger para updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION public.fin_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS fin_pj_updated_at ON public.fin_pj_periodos;
DROP TRIGGER IF EXISTS fin_pf_updated_at ON public.fin_pf_periodos;

CREATE TRIGGER fin_pj_updated_at BEFORE UPDATE ON public.fin_pj_periodos
  FOR EACH ROW EXECUTE FUNCTION public.fin_set_updated_at();
CREATE TRIGGER fin_pf_updated_at BEFORE UPDATE ON public.fin_pf_periodos
  FOR EACH ROW EXECUTE FUNCTION public.fin_set_updated_at();
