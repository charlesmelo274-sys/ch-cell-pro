-- ==============================================================================
-- CH CELL PRO — VINCULAR E CONFIGURAR LOGIN DE OZEAS FERREIRA NO SUPABASE
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Se o usuário não existir no Supabase Auth, ele cria automaticamente!
-- Sem comandos ALTER TABLE nem POLICY (zero erro 42501).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_auth_user_id UUID;
    v_loja_id UUID;
    v_func_id UUID;
    v_target_email TEXT := 'ozeasferreira40@gmail.com';
BEGIN
    -- 1. Verifica se já existe algum usuário no Supabase Auth com esse e-mail ou parecido
    SELECT id INTO v_auth_user_id 
    FROM auth.users 
    WHERE LOWER(email) = LOWER(v_target_email)
       OR LOWER(email) LIKE '%ozeasferreira40%'
       OR LOWER(email) LIKE '%ozeas%'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Se não existir no Auth, cria automaticamente o usuário no auth.users e auth.identities
    IF v_auth_user_id IS NULL THEN
        v_auth_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_auth_user_id,
            'authenticated',
            'authenticated',
            v_target_email,
            crypt('12345678Ch@', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"nome":"Ozeas Ferreira","full_name":"Ozeas Ferreira"}'::jsonb,
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );

        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_auth_user_id,
            v_auth_user_id::text,
            json_build_object('sub', v_auth_user_id::text, 'email', v_target_email)::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Usuário criado com sucesso no Supabase Authentication: % (ID: %)', v_target_email, v_auth_user_id;
    ELSE
        -- Se já existia, garante nome atualizado nos metadados
        UPDATE auth.users 
        SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{nome}', '"Ozeas Ferreira"')
        WHERE id = v_auth_user_id;
        
        RAISE NOTICE 'Usuário existente localizado no Supabase Authentication: (ID: %)', v_auth_user_id;
    END IF;

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
    WHERE LOWER(email) = LOWER(v_target_email)
       OR user_id = v_auth_user_id
       OR LOWER(nome) LIKE '%ozeas%'
    LIMIT 1;

    IF v_func_id IS NULL THEN
        INSERT INTO public.funcionarios (nome, email, telefone, funcao, ativo, observacoes, user_id)
        VALUES ('Ozeas Ferreira', v_target_email, '21999998888', 'Gerente', true, 'Gerente da Loja - Gestão Geral, Equipe e Balcão', v_auth_user_id)
        RETURNING id INTO v_func_id;
    ELSE
        UPDATE public.funcionarios
        SET nome = 'Ozeas Ferreira',
            email = v_target_email,
            funcao = 'Gerente',
            ativo = true,
            user_id = v_auth_user_id,
            observacoes = 'Gerente da Loja - Gestão Geral, Equipe e Balcão',
            updated_at = NOW()
        WHERE id = v_func_id;
    END IF;

    -- 4. Cria ou atualiza o acesso como Gerente com troca de senha inicial liberada
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

    RAISE NOTICE 'Tudo concluído! Gerente Ozeas Ferreira 100%% configurado.';
END $$;

-- 5. Exibe os dados criados/vinculados
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
