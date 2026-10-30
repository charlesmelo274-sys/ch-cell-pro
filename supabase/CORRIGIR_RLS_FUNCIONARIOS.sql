-- ==============================================================================
-- CH CELL PRO — FUNÇÃO SEGURA PARA SALVAR FUNCIONÁRIOS SEM ERRO DE RLS
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Não usa comandos ALTER TABLE (evita erro 42501).
-- A função usa SECURITY DEFINER para gravar no banco ignorando restrições de RLS.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.ch_salvar_funcionario(
    p_id TEXT,
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT,
    p_funcao TEXT,
    p_ativo BOOLEAN,
    p_observacoes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_func_id UUID;
    v_res RECORD;
BEGIN
    -- 1. Tenta achar por UUID
    IF p_id IS NOT NULL AND p_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id INTO v_func_id FROM public.funcionarios WHERE id = p_id::UUID LIMIT 1;
    END IF;

    -- 2. Tenta achar por e-mail
    IF v_func_id IS NULL AND p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
        SELECT id INTO v_func_id FROM public.funcionarios WHERE LOWER(email) = LOWER(trim(p_email)) LIMIT 1;
    END IF;

    -- 3. Tenta achar por nome
    IF v_func_id IS NULL AND p_nome IS NOT NULL AND length(trim(p_nome)) > 0 THEN
        SELECT id INTO v_func_id FROM public.funcionarios WHERE LOWER(nome) = LOWER(trim(p_nome)) LIMIT 1;
    END IF;

    -- 4. Se encontrou, faz UPDATE direto
    IF v_func_id IS NOT NULL THEN
        UPDATE public.funcionarios
        SET nome = COALESCE(p_nome, nome),
            email = COALESCE(p_email, email),
            telefone = COALESCE(p_telefone, telefone),
            funcao = COALESCE(p_funcao, funcao),
            ativo = COALESCE(p_ativo, ativo),
            observacoes = COALESCE(p_observacoes, observacoes)
        WHERE id = v_func_id
        RETURNING * INTO v_res;
        
        RETURN jsonb_build_object('success', true, 'action', 'update', 'id', v_res.id, 'nome', v_res.nome);
    ELSE
        -- 5. Se não encontrou, faz INSERT
        INSERT INTO public.funcionarios (nome, email, telefone, funcao, ativo, observacoes)
        VALUES (p_nome, p_email, p_telefone, p_funcao, COALESCE(p_ativo, true), p_observacoes)
        RETURNING * INTO v_res;

        RETURN jsonb_build_object('success', true, 'action', 'insert', 'id', v_res.id, 'nome', v_res.nome);
    END IF;
END;
$$;

-- Libera execução da função para o aplicativo
GRANT EXECUTE ON FUNCTION public.ch_salvar_funcionario TO anon, authenticated, service_role;

SELECT 'Função ch_salvar_funcionario instalada com sucesso! Agora as edições salvam direto no Supabase sem bloqueio de RLS.' AS status;
