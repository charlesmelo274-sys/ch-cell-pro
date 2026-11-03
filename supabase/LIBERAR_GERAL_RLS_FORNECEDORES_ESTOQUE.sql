-- ==============================================================================
-- CH CELL PRO — LIBERAÇÃO COMPLETA DE PERMISSÕES E RLS
-- (FORNECEDORES, ESTOQUE DE PRODUTOS, MOVIMENTAÇÕES, EBOOKS E VIDEOAULAS)
-- 
-- ONDE EXECUTAR:
-- Acesse o painel do Supabase: https://supabase.com/dashboard/project/nbqavsaccrlexnjazbdf/sql
-- Cole todo este conteúdo no SQL Editor e clique em "RUN".
-- ==============================================================================

-- 1. Garantir existência da tabela fornecedores com tipos corretos
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    marca TEXT,
    especialidade TEXT,
    whatsapp TEXT,
    telefone TEXT,
    endereco TEXT,
    site TEXT,
    observacoes TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garantir existência da tabela estoque_produtos com tipos corretos
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

-- 3. Garantir existência da tabela estoque_movimentacoes
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id TEXT PRIMARY KEY,
    produto_id TEXT,
    tipo TEXT NOT NULL,
    quantidade INT DEFAULT 1,
    motivo TEXT,
    os_id TEXT,
    responsavel TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Desabilitar RLS ou criar políticas universais sem restrições
-- Isso resolve definitivamente o erro: "new row violates row-level security policy"
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videoaulas ENABLE ROW LEVEL SECURITY;

-- Limpa políticas restritivas anteriores
DROP POLICY IF EXISTS "fornecedores_universal_policy" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_permitir_tudo" ON public.fornecedores;
DROP POLICY IF EXISTS "Users can only access their own suppliers" ON public.fornecedores;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.fornecedores;

DROP POLICY IF EXISTS "estoque_produtos_universal_policy" ON public.estoque_produtos;
DROP POLICY IF EXISTS "estoque_produtos_permitir_tudo" ON public.estoque_produtos;

DROP POLICY IF EXISTS "estoque_movimentacoes_universal_policy" ON public.estoque_movimentacoes;
DROP POLICY IF EXISTS "estoque_movimentacoes_permitir_tudo" ON public.estoque_movimentacoes;

DROP POLICY IF EXISTS "ebooks_universal_policy" ON public.ebooks;
DROP POLICY IF EXISTS "videoaulas_universal_policy" ON public.videoaulas;

-- Cria políticas 100% permissivas para SELECT, INSERT, UPDATE, DELETE (anon e authenticated)
CREATE POLICY "fornecedores_universal_policy" ON public.fornecedores
    FOR ALL TO public, anon, authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "estoque_produtos_universal_policy" ON public.estoque_produtos
    FOR ALL TO public, anon, authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "estoque_movimentacoes_universal_policy" ON public.estoque_movimentacoes
    FOR ALL TO public, anon, authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "ebooks_universal_policy" ON public.ebooks
    FOR ALL TO public, anon, authenticated
    USING (true) WITH CHECK (true);

CREATE POLICY "videoaulas_universal_policy" ON public.videoaulas
    FOR ALL TO public, anon, authenticated
    USING (true) WITH CHECK (true);

-- 5. Conceder permissões para os papéis anon, authenticated e service_role
GRANT ALL ON TABLE public.fornecedores TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.estoque_produtos TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.estoque_movimentacoes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ebooks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.videoaulas TO anon, authenticated, service_role;

SELECT 'RLS e permissões de Fornecedores, Estoque, Movimentações, eBooks e Vídeos liberados com sucesso!' AS status;
