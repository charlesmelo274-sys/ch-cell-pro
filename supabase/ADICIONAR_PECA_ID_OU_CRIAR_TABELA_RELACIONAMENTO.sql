-- ==============================================================================
-- CH CELL PRO — TABELA DE RELACIONAMENTO OS_PECAS_ESTOQUE & SUPORTE A PECA_ID
-- ==============================================================================

-- Opção 1: Tabela relacional os_pecas_estoque (Recomendada e já conectada no frontend)
CREATE TABLE IF NOT EXISTS public.os_pecas_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    peca_id UUID REFERENCES public.estoque_produtos(id) ON DELETE SET NULL,
    produto_id UUID REFERENCES public.estoque_produtos(id) ON DELETE SET NULL,
    quantidade INT DEFAULT 1,
    custo_unitario NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.os_pecas_estoque DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.os_pecas_estoque TO anon, authenticated, service_role;

-- Opção 2: Adiciona peca_id e peca_quantidade diretamente na tabela ordens_servico
ALTER TABLE IF EXISTS public.ordens_servico ADD COLUMN IF NOT EXISTS peca_id UUID REFERENCES public.estoque_produtos(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.ordens_servico ADD COLUMN IF NOT EXISTS peca_quantidade INT DEFAULT 1;

SELECT 'Tabela os_pecas_estoque e colunas de suporte configuradas com sucesso!' AS status;
