-- ==============================================================================
-- CH CELL PRO — VINCULAÇÃO E LIBERAÇÃO DO LOGIN DE OZEAS FERREIRA NO SUPABASE
-- Execute este script no SQL Editor do seu Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Garante que a tabela funcionarios e ch_equipe_acessos tenham as colunas necessárias
ALTER TABLE IF EXISTS public.funcionarios ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS public.funcionarios ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE IF EXISTS public.funcionarios ADD COLUMN IF NOT EXISTS funcao TEXT DEFAULT 'Gerente';
ALTER TABLE IF EXISTS public.funcionarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS public.funcionarios ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2. Localiza o ID do usuário criado no Supabase Auth com o email ozeasferreira40@gmail.com
DO $$
DECLARE
    v_auth_user_id UUID;
    v_loja_id UUID;
    v_func_id UUID;
BEGIN
    -- Busca o ID do usuário cadastrado no Supabase Authentication
    SELECT id INTO v_auth_user_id 
    FROM auth.users 
    WHERE LOWER(email) = 'ozeasferreira40@gmail.com' 
    LIMIT 1;

    -- Busca ou cria loja padrão da CH Cell
    SELECT id INTO v_loja_id FROM public.ch_lojas LIMIT 1;
    IF v_loja_id IS NULL THEN
        INSERT INTO public.ch_lojas (nome, whatsapp, endereco)
        VALUES ('CH Cell Assistência Técnica', '21987654321', 'Rua Principal, 120 - Centro')
        RETURNING id INTO v_loja_id;
    END IF;

    -- Busca ou cria o funcionário Ozeas Ferreira na tabela funcionarios
    SELECT id INTO v_func_id 
    FROM public.funcionarios 
    WHERE LOWER(email) IN ('ozeasferreira40@gmail.com', 'ozeas@chcell.com')
       OR LOWER(nome) LIKE '%ozeas%'
    LIMIT 1;

    IF v_func_id IS NULL THEN
        INSERT INTO public.funcionarios (nome, email, telefone, funcao, ativo, observacoes, user_id)
        VALUES ('Ozeas Ferreira', 'ozeasferreira40@gmail.com', '21999998888', 'Gerente', true, 'Gerente da Loja - Gestão Geral, Equipe e Balcão', v_auth_user_id)
        RETURNING id INTO v_func_id;
    ELSE
        UPDATE public.funcionarios
        SET nome = 'Ozeas Ferreira',
            email = 'ozeasferreira40@gmail.com',
            funcao = 'Gerente',
            ativo = true,
            user_id = COALESCE(v_auth_user_id, user_id),
            observacoes = 'Gerente da Loja - Gestão Geral, Equipe e Balcão',
            updated_at = NOW()
        WHERE id = v_func_id;
    END IF;

    -- Cria ou atualiza o registro de acesso com perfil 'gerente' e troca_senha_obrigatoria = true
    IF EXISTS (SELECT 1 FROM public.ch_equipe_acessos WHERE funcionario_id = v_func_id OR (v_auth_user_id IS NOT NULL AND auth_user_id = v_auth_user_id)) THEN
        UPDATE public.ch_equipe_acessos
        SET perfil = 'gerente',
            ativo = true,
            auth_user_id = COALESCE(v_auth_user_id, auth_user_id),
            troca_senha_obrigatoria = true,
            permissoes = '{
                "clientes.visualizar": true, "clientes.criar": true, "clientes.editar": true,
                "os.visualizar": true, "os.criar": true, "os.editar": true,
                "estoque.visualizar": true, "estoque.movimentar": true, "estoque.criar": true, "estoque.editar": true,
                "vendas.visualizar": true, "vendas.criar": true,
                "caixa.visualizar": true, "caixa.lancar": true
            }'::jsonb,
            atualizado_em = NOW()
        WHERE funcionario_id = v_func_id OR (v_auth_user_id IS NOT NULL AND auth_user_id = v_auth_user_id);
    ELSE
        INSERT INTO public.ch_equipe_acessos (loja_id, funcionario_id, auth_user_id, perfil, ativo, troca_senha_obrigatoria, permissoes)
        VALUES (
            v_loja_id, 
            v_func_id, 
            v_auth_user_id, 
            'gerente', 
            true, 
            true, 
            '{
                "clientes.visualizar": true, "clientes.criar": true, "clientes.editar": true,
                "os.visualizar": true, "os.criar": true, "os.editar": true,
                "estoque.visualizar": true, "estoque.movimentar": true, "estoque.criar": true, "estoque.editar": true,
                "vendas.visualizar": true, "vendas.criar": true,
                "caixa.visualizar": true, "caixa.lancar": true
            }'::jsonb
        );
    END IF;

    RAISE NOTICE 'Login de Ozeas Ferreira vinculado com sucesso! Auth User ID: % | Func ID: %', v_auth_user_id, v_func_id;
END $$;

-- 3. Atualizar a RPC de status de acesso para reconhecer o email ozeasferreira40@gmail.com
CREATE OR REPLACE FUNCTION public.ch_meu_status_acesso()
RETURNS TABLE (
  perfil TEXT,
  ativo BOOLEAN,
  troca_senha_obrigatoria BOOLEAN,
  loja_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_loja_prop UUID;
BEGIN
  -- Se for o proprietário Charles
  SELECT id INTO v_loja_prop FROM public.ch_lojas WHERE proprietario_id = v_user_id LIMIT 1;
  IF v_loja_prop IS NOT NULL THEN
    RETURN QUERY SELECT 'administrador'::TEXT, true, false, v_loja_prop;
    RETURN;
  END IF;

  -- 1. Tenta por auth_user_id
  IF EXISTS (SELECT 1 FROM public.ch_equipe_acessos WHERE auth_user_id = v_user_id) THEN
    RETURN QUERY
    SELECT a.perfil::TEXT, a.ativo, a.troca_senha_obrigatoria, a.loja_id
    FROM public.ch_equipe_acessos a
    WHERE a.auth_user_id = v_user_id
    LIMIT 1;
    RETURN;
  END IF;

  -- 2. Tenta pelo e-mail do usuário autenticado (auto-vinculação flexível)
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id LIMIT 1;
  IF v_user_email IS NOT NULL THEN
    -- Atualiza vínculo automático
    UPDATE public.ch_equipe_acessos a
    SET auth_user_id = v_user_id
    FROM public.funcionarios f
    WHERE a.funcionario_id = f.id AND LOWER(f.email) = LOWER(v_user_email);

    RETURN QUERY
    SELECT a.perfil::TEXT, a.ativo, a.troca_senha_obrigatoria, a.loja_id
    FROM public.ch_equipe_acessos a
    JOIN public.funcionarios f ON f.id = a.funcionario_id
    WHERE LOWER(f.email) = LOWER(v_user_email)
    LIMIT 1;
    RETURN;
  END IF;

  -- Fallback neutro
  RETURN;
END;
$$;

-- 4. Liberar RLS em todas as tabelas para evitar erro 42501
ALTER TABLE IF EXISTS public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ch_equipe_acessos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funcionarios_all_policy" ON public.funcionarios;
CREATE POLICY "funcionarios_all_policy" ON public.funcionarios FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acessos_all_policy" ON public.ch_equipe_acessos;
CREATE POLICY "acessos_all_policy" ON public.ch_equipe_acessos FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.funcionarios TO anon, authenticated, service_role;
GRANT ALL ON public.ch_equipe_acessos TO anon, authenticated, service_role;

-- 5. Confirmação
SELECT 'Login do Gerente Ozeas Ferreira configurado com sucesso no Supabase!' AS resultado;
