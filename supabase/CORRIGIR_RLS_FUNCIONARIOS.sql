-- ==============================================================================
-- CH CELL PRO - CORREÇÃO DEFINITIVA DE PERMISSÕES E RLS DA TABELA FUNCIONARIOS
-- Execute este script no SQL Editor do seu Supabase para liberar o UPDATE e INSERT
-- ==============================================================================

-- 1. Desabilitar temporariamente RLS para limpeza de políticas antigas conflitantes
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ch_equipe_acessos DISABLE ROW LEVEL SECURITY;

-- 2. Garantir colunas necessárias na tabela de funcionários
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS funcao TEXT DEFAULT 'Técnico';
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Remover políticas antigas que possam estar bloqueando o UPDATE
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename IN ('funcionarios', 'ch_equipe_acessos')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, 'funcionarios');
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, 'ch_equipe_acessos');
    END LOOP;
END $$;

-- 4. Reabilitar Row Level Security (RLS)
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ch_equipe_acessos ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas Permissivas para SELECT, INSERT, UPDATE e DELETE (anon e authenticated)
-- Isso permite que tanto o painel web (usando chave anon/publica) quanto usuários autenticados salvem e editem
CREATE POLICY "funcionarios_select_policy"
  ON public.funcionarios
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

CREATE POLICY "funcionarios_insert_policy"
  ON public.funcionarios
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

CREATE POLICY "funcionarios_update_policy"
  ON public.funcionarios
  FOR UPDATE
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "funcionarios_delete_policy"
  ON public.funcionarios
  FOR DELETE
  TO public, anon, authenticated
  USING (true);

-- 6. Políticas para a tabela de acessos da equipe
CREATE POLICY "acessos_select_policy"
  ON public.ch_equipe_acessos
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

CREATE POLICY "acessos_insert_policy"
  ON public.ch_equipe_acessos
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

CREATE POLICY "acessos_update_policy"
  ON public.ch_equipe_acessos
  FOR UPDATE
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "acessos_delete_policy"
  ON public.ch_equipe_acessos
  FOR DELETE
  TO public, anon, authenticated
  USING (true);

-- 7. Conceder permissões explícitas de GRANT para roles anon e authenticated
GRANT ALL ON public.funcionarios TO anon, authenticated, service_role;
GRANT ALL ON public.ch_equipe_acessos TO anon, authenticated, service_role;

-- 8. Mensagem de confirmação
SELECT 'Políticas de RLS corrigidas com sucesso para funcionarios e acessos!' as resultado;
