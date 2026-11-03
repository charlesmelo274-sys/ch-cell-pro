-- ==============================================================================
-- CH CELL PRO — GARANTIR TABELAS DE ESTOQUE E FORNECEDORES NO SUPABASE
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Cria ou ajusta as tabelas 'estoque_produtos' e 'fornecedores' com permissões abertas
-- ==============================================================================

-- 1. Tabela de Fornecedores
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

-- 2. Tabela de Produtos / Peças de Estoque
CREATE TABLE IF NOT EXISTS public.estoque_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    categoria TEXT DEFAULT 'Geral',
    sku TEXT,
    custo NUMERIC(10,2) DEFAULT 0,
    preco NUMERIC(10,2) DEFAULT 0,
    quantidade INT DEFAULT 0,
    minimo INT DEFAULT 2,
    icone TEXT DEFAULT 'package',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilita RLS e cria políticas 100% abertas para evitar bloqueio
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fornecedores_universal_policy" ON public.fornecedores;
CREATE POLICY "fornecedores_universal_policy" ON public.fornecedores
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "estoque_produtos_universal_policy" ON public.estoque_produtos;
CREATE POLICY "estoque_produtos_universal_policy" ON public.estoque_produtos
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões de acesso
GRANT ALL ON public.fornecedores TO anon, authenticated, service_role;
GRANT ALL ON public.estoque_produtos TO anon, authenticated, service_role;

SELECT 'Tabelas estoque_produtos e fornecedores configuradas com sucesso!' AS status;
