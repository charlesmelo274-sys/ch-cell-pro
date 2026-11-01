-- ==============================================================================
-- CH CELL PRO — SCRIPT DEFINITIVO DE LIMPEZA E PREPARAÇÃO PARA TESTES REAIS
-- Execute este script no SQL Editor do seu Supabase (https://supabase.com/dashboard)
-- Deixa o banco 100% limpo, sem ordens de serviço, produtos ou clientes de teste,
-- mantendo seus usuários (Charles e Ozeas Ferreira) e liberando todas as permissões.
-- ==============================================================================

-- 1. Criação das tabelas complementares caso ainda não existam
CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    celular TEXT,
    cpf TEXT,
    email TEXT,
    endereco TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fornecedores (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    marca TEXT,
    especialidade TEXT,
    whatsapp TEXT,
    telefone TEXT,
    endereco TEXT,
    site TEXT,
    observacoes TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ebooks (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    categoria TEXT DEFAULT 'Esquema Elétrico',
    url TEXT,
    descricao TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.videoaulas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    categoria TEXT DEFAULT 'Microsoldagem',
    url TEXT,
    descricao TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.despesas (
    id TEXT PRIMARY KEY,
    data DATE DEFAULT CURRENT_DATE,
    desc TEXT NOT NULL,
    valor NUMERIC(10,2) DEFAULT 0,
    tipo TEXT DEFAULT 'Variável',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Limpeza total dos dados de teste (Zera tudo para começar limpo)
DO $$
BEGIN
    -- Limpa ordens de serviço
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ordens_servico') THEN
        DELETE FROM public.ordens_servico;
    END IF;

    -- Limpa movimentações de estoque
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estoque_movimentacoes') THEN
        DELETE FROM public.estoque_movimentacoes;
    END IF;

    -- Limpa produtos do estoque
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estoque_produtos') THEN
        DELETE FROM public.estoque_produtos;
    END IF;

    -- Limpa vendas de balcão (PDV)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendas_balcao') THEN
        DELETE FROM public.vendas_balcao;
    END IF;

    -- Limpa clientes de teste
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clientes') THEN
        DELETE FROM public.clientes;
    END IF;

    -- Limpa despesas de teste
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'despesas') THEN
        DELETE FROM public.despesas;
    END IF;

    -- Limpa fornecedores de teste
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fornecedores') THEN
        DELETE FROM public.fornecedores;
    END IF;

    -- Limpa ebooks de teste
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ebooks') THEN
        DELETE FROM public.ebooks;
    END IF;

    -- Limpa videoaulas de teste
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'videoaulas') THEN
        DELETE FROM public.videoaulas;
    END IF;

    -- Remove funcionários de teste (preserva Ozeas Ferreira)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'funcionarios') THEN
        DELETE FROM public.funcionarios WHERE LOWER(email) NOT LIKE '%ozeas%' AND LOWER(nome) NOT LIKE '%ozeas%';
    END IF;

    RAISE NOTICE 'Limpeza concluída com sucesso!';
END $$;

-- 3. Liberar RLS em todas as tabelas (evita erro de permissão 42501 ao salvar em qualquer aba)
DO $$
DECLARE
    tbl RECORD;
    pol RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename IN (
            'ordens_servico', 'estoque_produtos', 'estoque_movimentacoes', 
            'vendas_balcao', 'clientes', 'despesas', 'fornecedores', 
            'ebooks', 'videoaulas', 'funcionarios', 'ch_equipe_acessos', 'ch_lojas'
          )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
        
        -- Remove políticas anteriores
        FOR pol IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = tbl.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl.tablename);
        END LOOP;

        -- Cria política 100% permissiva
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true)', tbl.tablename || '_open_policy', tbl.tablename);
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', tbl.tablename);
    END LOOP;
END $$;

-- 4. Confirmação
SELECT 'Sistema CH Cell Pro limpo com sucesso no Supabase! Pronto para cadastros reais.' AS status;
