-- ==============================================================================
-- CH CELL PRO — CORREÇÃO DEFINITIVA DE PERMISSÕES E RLS PARA TODAS AS ABAS
-- Execute este script no SQL Editor do seu projeto Supabase
-- (Isso libera a sincronização imediata do Celular, PC e Vercel sem erros 42501)
-- ==============================================================================

-- 1. Garantir que todas as tabelas existam com colunas completas

-- Tabela de eBooks & Manuais
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

-- Tabela de Videoaulas
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

-- Tabela de Fornecedores
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

-- Tabela de Clientes
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

-- Tabela de Despesas Financeiras
CREATE TABLE IF NOT EXISTS public.despesas (
    id TEXT PRIMARY KEY,
    data DATE DEFAULT CURRENT_DATE,
    desc TEXT NOT NULL,
    valor NUMERIC(10,2) DEFAULT 0,
    tipo TEXT DEFAULT 'Variável',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Limpar políticas antigas restritivas de todas as tabelas
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
            'ebooks', 'videoaulas', 'fornecedores', 'clientes', 'despesas',
            'ordens_servico', 'estoque_produtos', 'estoque_movimentacoes',
            'vendas_balcao', 'funcionarios', 'ch_equipe_acessos', 'ch_lojas'
          )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
        
        FOR pol IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = tbl.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl.tablename);
        END LOOP;

        -- Cria política universal aberta para SELECT, INSERT, UPDATE e DELETE
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true)', 
                       tbl.tablename || '_universal_policy', tbl.tablename);
        
        -- Concede permissões completas
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', tbl.tablename);
    END LOOP;
END $$;

-- 3. Mensagem de confirmação de sucesso
SELECT 'Todas as tabelas e políticas de RLS foram configuradas com 100% de compatibilidade para PC e Celular!' as status;
