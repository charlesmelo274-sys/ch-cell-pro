-- ==============================================================================
-- CH CELL PRO — VINCULAR E CONFIGURAR LOGIN DE OZEAS FERREIRA NO SUPABASE
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Não usa comandos ALTER TABLE nem POLICY, evitando o erro 42501.
-- ==============================================================================

DO $$
DECLARE
    v_auth_user_id UUID;
    v_loja_id UUID;
    v_func_id UUID;
BEGIN
    -- 1. Localiza o usuário no Supabase Authentication
    SELECT id INTO v_auth_user_id 
    FROM auth.users 
    WHERE LOWER(email) = 'ozeasferreira40@gmail.com' 
    LIMIT 1;

    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário com o e-mail ozeasferreira40@gmail.com não foi encontrado na aba Authentication do Supabase!';
    END IF;

    -- Atualiza metadados do usuário para exibir o nome Ozeas Ferreira
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{nome}', '"Ozeas Ferreira"')
    WHERE id = v_auth_user_id;

    -- 2. Localiza ou cria a loja para vínculo
    SELECT id INTO v_loja_id FROM public.ch_lojas LIMIT 1;
    IF v_loja_id IS NULL THEN
        INSERT INTO public.ch_lojas (nome, whatsapp, endereco)
        VALUES ('CH Cell Assistência Técnica', '21987654321', 'Rua Principal, 120 - Centro')
        RETURNING id INTO v_loja_id;
    END IF;

    -- 3. Localiza ou insere Ozeas Ferreira na tabela funcionarios
    SELECT id INTO v_func_id 
    FROM public.funcionarios 
    WHERE LOWER(email) = 'ozeasferreira40@gmail.com'
       OR user_id = v_auth_user_id
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
            user_id = v_auth_user_id,
            observacoes = 'Gerente da Loja - Gestão Geral, Equipe e Balcão',
            updated_at = NOW()
        WHERE id = v_func_id;
    END IF;

    -- 4. Cria ou atualiza o acesso como Gerente com primeiro acesso liberado
    IF EXISTS (SELECT 1 FROM public.ch_equipe_acessos WHERE funcionario_id = v_func_id OR auth_user_id = v_auth_user_id) THEN
        UPDATE public.ch_equipe_acessos
        SET perfil = 'gerente',
            ativo = true,
            auth_user_id = v_auth_user_id,
            troca_senha_obrigatoria = true,
            loja_id = COALESCE(loja_id, v_loja_id),
            permissoes = '{
                "clientes.visualizar": true, "clientes.criar": true, "clientes.editar": true,
                "os.visualizar": true, "os.criar": true, "os.editar": true,
                "estoque.visualizar": true, "estoque.movimentar": true, "estoque.criar": true, "estoque.editar": true,
                "vendas.visualizar": true, "vendas.criar": true,
                "caixa.visualizar": true, "caixa.lancar": true
            }'::jsonb,
            atualizado_em = NOW()
        WHERE funcionario_id = v_func_id OR auth_user_id = v_auth_user_id;
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

    RAISE NOTICE 'Sucesso! Login do Gerente Ozeas Ferreira vinculado e pronto para criar a primeira senha.';
END $$;

-- 5. Consulta de confirmação para conferir o resultado
SELECT 
    f.nome AS funcionario,
    f.email,
    f.funcao,
    a.perfil,
    a.ativo,
    a.troca_senha_obrigatoria,
    u.id AS auth_user_id
FROM public.funcionarios f
LEFT JOIN public.ch_equipe_acessos a ON a.funcionario_id = f.id
LEFT JOIN auth.users u ON u.id = a.auth_user_id
WHERE LOWER(f.email) = 'ozeasferreira40@gmail.com' OR u.id = a.auth_user_id;
