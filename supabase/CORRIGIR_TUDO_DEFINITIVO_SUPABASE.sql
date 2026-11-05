-- ==============================================================================
-- CH CELL PRO — CORREÇÃO ESTRUTURAL COMPLETA DEFINITIVA
-- LIBERAÇÃO TOTAL DE PERMISSÕES, RLS, IDENTIDADES E COLUNAS
--
-- COMO EXECUTAR:
-- 1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/nbqavsaccrlexnjazbdf/sql
-- 2. Cole este código no SQL Editor e clique em "RUN".
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. GARANTIR TABELAS E COLUNAS
-- ------------------------------------------------------------------------------

-- Tabela: clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    celular TEXT,
    email TEXT,
    endereco TEXT,
    observacoes TEXT,
    user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.clientes ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE IF EXISTS public.clientes ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE IF EXISTS public.clientes ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid;
ALTER TABLE IF EXISTS public.clientes ALTER COLUMN user_id DROP NOT NULL;

-- Tabela: ordens_servico
CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero TEXT,
    cliente_nome TEXT NOT NULL,
    cliente_celular TEXT,
    marca TEXT,
    modelo TEXT,
    defeito_relatado TEXT,
    servico TEXT,
    status TEXT DEFAULT 'Em Análise',
    funcionario_id UUID,
    valor NUMERIC(10,2) DEFAULT 0,
    valor_pago NUMERIC(10,2) DEFAULT 0,
    custo_peca NUMERIC(10,2) DEFAULT 0,
    checklist_checkin JSONB DEFAULT '{}'::jsonb,
    fotos_checkin JSONB DEFAULT '[]'::jsonb,
    data_entrada DATE DEFAULT CURRENT_DATE,
    previsao_entrega DATE,
    observacoes TEXT,
    user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Remove restrição de IDENTITY da coluna numero para permitir inserção de códigos personalizados (ex: OS-2026-0001)
ALTER TABLE IF EXISTS public.ordens_servico ALTER COLUMN numero DROP IDENTITY IF EXISTS;
ALTER TABLE IF EXISTS public.ordens_servico ALTER COLUMN numero DROP NOT NULL;
ALTER TABLE IF EXISTS public.ordens_servico ADD COLUMN IF NOT EXISTS cor TEXT;
ALTER TABLE IF EXISTS public.ordens_servico ADD COLUMN IF NOT EXISTS senha TEXT;
ALTER TABLE IF EXISTS public.ordens_servico ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid;
ALTER TABLE IF EXISTS public.ordens_servico ALTER COLUMN user_id DROP NOT NULL;

-- Tabela: estoque_produtos
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
    user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.estoque_produtos ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'package';
ALTER TABLE IF EXISTS public.estoque_produtos ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid;
ALTER TABLE IF EXISTS public.estoque_produtos ALTER COLUMN user_id DROP NOT NULL;

-- Tabela: fornecedores
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
    user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.fornecedores ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid;
ALTER TABLE IF EXISTS public.fornecedores ALTER COLUMN user_id DROP NOT NULL;

-- Tabela: vendas_balcao
CREATE TABLE IF NOT EXISTS public.vendas_balcao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_nome TEXT DEFAULT 'Cliente Balcão',
    forma_pagamento TEXT DEFAULT 'Pix',
    total NUMERIC(10,2) DEFAULT 0,
    custo_total NUMERIC(10,2) DEFAULT 0,
    itens JSONB DEFAULT '[]'::jsonb,
    user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.vendas_balcao ADD COLUMN IF NOT EXISTS itens JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.vendas_balcao ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid;
ALTER TABLE IF EXISTS public.vendas_balcao ALTER COLUMN user_id DROP NOT NULL;

-- Tabela: estoque_movimentacoes
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID,
    tipo TEXT NOT NULL,
    quantidade INT DEFAULT 1,
    motivo TEXT,
    os_id TEXT,
    user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE IF EXISTS public.estoque_movimentacoes ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT '1206a84c-8e81-4c3b-b2dc-0f298d04841b'::uuid;
ALTER TABLE IF EXISTS public.estoque_movimentacoes ALTER COLUMN user_id DROP NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. DESATIVAR RLS (ROW LEVEL SECURITY) OU CRIAR POLÍTICAS 100% ABERTAS
-- ------------------------------------------------------------------------------
ALTER TABLE public.ordens_servico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas_balcao DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_produtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videoaulas DISABLE ROW LEVEL SECURITY;

-- Garante também políticas caso RLS seja reativado no futuro
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas_balcao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videoaulas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "os_open" ON public.ordens_servico;
CREATE POLICY "os_open" ON public.ordens_servico FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "clientes_open" ON public.clientes;
CREATE POLICY "clientes_open" ON public.clientes FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vendas_open" ON public.vendas_balcao;
CREATE POLICY "vendas_open" ON public.vendas_balcao FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "estoque_open" ON public.estoque_produtos;
CREATE POLICY "estoque_open" ON public.estoque_produtos FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "fornecedores_open" ON public.fornecedores;
CREATE POLICY "fornecedores_open" ON public.fornecedores FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "mov_open" ON public.estoque_movimentacoes;
CREATE POLICY "mov_open" ON public.estoque_movimentacoes FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ebooks_open" ON public.ebooks;
CREATE POLICY "ebooks_open" ON public.ebooks FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "videoaulas_open" ON public.videoaulas;
CREATE POLICY "videoaulas_open" ON public.videoaulas FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. CONCESSÃO DE PERMISSÕES PARA OS PAPÉIS ANON, AUTHENTICATED E SERVICE_ROLE
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.ordens_servico TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.clientes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.vendas_balcao TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.estoque_produtos TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.fornecedores TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.estoque_movimentacoes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ebooks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.videoaulas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.funcionarios TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ch_lojas TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ch_equipe_acessos TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

SELECT 'Tudo corrigido com sucesso! Permissões, colunas e RLS 100% liberados para o CH Cell Pro.' AS status;
