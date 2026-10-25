-- ==============================================================================
-- CH CELL PRO - ESQUEMA COMPLETO DO BANCO DE DADOS SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Lojas da CH Cell
CREATE TABLE IF NOT EXISTS public.ch_lojas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL DEFAULT 'CH Cell Assistência Técnica',
    proprietario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    whatsapp TEXT DEFAULT '21987654321',
    endereco TEXT DEFAULT 'Rua Principal, 120 - Centro',
    termo_garantia TEXT DEFAULT 'Garantia legal de 90 dias referente ao serviço executado e à peça substituída.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Funcionários e Colaboradores
CREATE TABLE IF NOT EXISTS public.funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    funcao TEXT DEFAULT 'Técnico',
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela do Catálogo de Permissões
CREATE TABLE IF NOT EXISTS public.ch_permissoes_catalogo (
    codigo TEXT PRIMARY KEY,
    descricao TEXT NOT NULL,
    grupo TEXT NOT NULL
);

INSERT INTO public.ch_permissoes_catalogo (codigo, descricao, grupo) VALUES
  ('clientes.visualizar', 'Consultar lista e histórico de clientes', 'Clientes'),
  ('clientes.criar', 'Cadastrar novos clientes', 'Clientes'),
  ('clientes.editar', 'Editar informações de clientes cadastrados', 'Clientes'),
  ('clientes.excluir', 'Excluir cadastros de clientes', 'Clientes'),
  ('os.visualizar', 'Consultar ordens de serviço', 'Ordens de Serviço'),
  ('os.criar', 'Criar novas ordens de serviço', 'Ordens de Serviço'),
  ('os.editar', 'Atualizar dados, status e laudo da OS', 'Ordens de Serviço'),
  ('os.excluir', 'Cancelar ou excluir ordens de serviço', 'Ordens de Serviço'),
  ('estoque.visualizar', 'Consultar produtos e quantidades em estoque', 'Estoque e Peças'),
  ('estoque.movimentar', 'Dar entrada ou saída manual de itens no estoque', 'Estoque e Peças'),
  ('estoque.criar', 'Cadastrar novos produtos e peças', 'Estoque e Peças'),
  ('estoque.editar', 'Editar preços e custos de produtos', 'Estoque e Peças'),
  ('vendas.visualizar', 'Ver histórico de vendas rápidas de balcão', 'Vendas e Balcão'),
  ('vendas.criar', 'Realizar vendas de balcão e baixar itens', 'Vendas e Balcão'),
  ('financeiro.visualizar', 'Ver relatórios de faturamento e lucro estimado', 'Financeiro'),
  ('caixa.visualizar', 'Consultar fluxo de caixa e despesas', 'Financeiro'),
  ('caixa.lancar', 'Lançar novas despesas ou entradas manuais', 'Financeiro'),
  ('acessos.gerenciar', 'Gerenciar permissões e acessos de outros funcionários', 'Equipe e Acessos')
ON CONFLICT (codigo) DO UPDATE SET 
  descricao = EXCLUDED.descricao, 
  grupo = EXCLUDED.grupo;

-- 5. Tabela de Acessos e Permissões Individuais da Equipe
CREATE TABLE IF NOT EXISTS public.ch_equipe_acessos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID REFERENCES public.ch_lojas(id) ON DELETE CASCADE,
    funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    perfil TEXT DEFAULT 'funcionario', -- 'administrador' | 'gerente' | 'funcionario'
    ativo BOOLEAN DEFAULT true,
    troca_senha_obrigatoria BOOLEAN DEFAULT true,
    permissoes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Ordens de Serviço (OS)
CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero TEXT UNIQUE NOT NULL,
    cliente_nome TEXT NOT NULL,
    cliente_celular TEXT,
    marca TEXT,
    modelo TEXT,
    cor TEXT,
    senha TEXT,
    defeito_relatado TEXT,
    servico TEXT,
    status TEXT DEFAULT 'Em Análise',
    funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    valor NUMERIC(10,2) DEFAULT 0,
    valor_pago NUMERIC(10,2) DEFAULT 0,
    custo_peca NUMERIC(10,2) DEFAULT 0,
    checklist_checkin JSONB DEFAULT '{}'::jsonb,
    fotos_checkin JSONB DEFAULT '[]'::jsonb,
    data_entrada DATE DEFAULT CURRENT_DATE,
    previsao_entrega DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Estoque de Produtos e Peças
CREATE TABLE IF NOT EXISTS public.estoque_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 8. Tabela de Movimentações de Estoque (Subir / Abaixar)
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES public.estoque_produtos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'entrada' | 'saida'
    quantidade INT NOT NULL,
    motivo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela de Vendas de Balcão (PDV)
CREATE TABLE IF NOT EXISTS public.vendas_balcao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nome TEXT DEFAULT 'Cliente Balcão',
    forma_pagamento TEXT DEFAULT 'Pix',
    total NUMERIC(10,2) DEFAULT 0,
    custo_total NUMERIC(10,2) DEFAULT 0,
    itens JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- FUNÇÕES RPC SEGURAS (FUNCTIONS)
-- ==============================================================================

-- Status do usuário logado (RPC)
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
  v_loja_prop UUID;
BEGIN
  SELECT id INTO v_loja_prop FROM public.ch_lojas WHERE proprietario_id = v_user_id LIMIT 1;
  IF v_loja_prop IS NOT NULL THEN
    RETURN QUERY SELECT 'administrador'::TEXT, true, false, v_loja_prop;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT a.perfil::TEXT, a.ativo, a.troca_senha_obrigatoria, a.loja_id
  FROM public.ch_equipe_acessos a
  WHERE a.auth_user_id = v_user_id
  LIMIT 1;
END;
$$;

-- Alternar Ativo/Inativo de Colaborador (RPC)
CREATE OR REPLACE FUNCTION public.ch_admin_alternar_status_acesso(
  p_acesso_id UUID,
  p_ativo BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_loja_id UUID;
  v_proprietario_id UUID;
BEGIN
  SELECT a.loja_id, l.proprietario_id INTO v_loja_id, v_proprietario_id
  FROM public.ch_equipe_acessos a
  JOIN public.ch_lojas l ON l.id = a.loja_id
  WHERE a.id = p_acesso_id;

  IF NOT FOUND OR v_proprietario_id <> auth.uid() THEN
    RAISE EXCEPTION 'Apenas o proprietário da loja pode alterar o status de acesso.';
  END IF;

  UPDATE public.ch_equipe_acessos
  SET ativo = p_ativo, atualizado_em = NOW()
  WHERE id = p_acesso_id;

  RETURN jsonb_build_object('sucesso', true, 'ativo', p_ativo);
END;
$$;

-- Configurar Permissões de Colaborador (RPC)
CREATE OR REPLACE FUNCTION public.ch_admin_configurar_permissoes(
  p_acesso_id UUID,
  p_permissoes JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proprietario_id UUID;
BEGIN
  SELECT l.proprietario_id INTO v_proprietario_id
  FROM public.ch_equipe_acessos a
  JOIN public.ch_lojas l ON l.id = a.loja_id
  WHERE a.id = p_acesso_id;

  IF NOT FOUND OR v_proprietario_id <> auth.uid() THEN
    RAISE EXCEPTION 'Apenas o proprietário da loja pode configurar permissões.';
  END IF;

  UPDATE public.ch_equipe_acessos
  SET permissoes = p_permissoes, atualizado_em = NOW()
  WHERE id = p_acesso_id;

  RETURN jsonb_build_object('sucesso', true);
END;
$$;

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.ch_lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ch_permissoes_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ch_equipe_acessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas_balcao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de catalogo para autenticados"
  ON public.ch_permissoes_catalogo FOR SELECT TO authenticated USING (true);

CREATE POLICY "Acesso completo a dados da loja para autenticados"
  ON public.ch_lojas FOR ALL TO authenticated USING (true);

CREATE POLICY "Acesso completo a funcionarios para autenticados"
  ON public.funcionarios FOR ALL TO authenticated USING (true);

CREATE POLICY "Acesso completo a ordens de servico para autenticados"
  ON public.ordens_servico FOR ALL TO authenticated USING (true);

CREATE POLICY "Acesso completo ao estoque para autenticados"
  ON public.estoque_produtos FOR ALL TO authenticated USING (true);

CREATE POLICY "Acesso completo as movimentacoes para autenticados"
  ON public.estoque_movimentacoes FOR ALL TO authenticated USING (true);

CREATE POLICY "Acesso completo a vendas balcao para autenticados"
  ON public.vendas_balcao FOR ALL TO authenticated USING (true);
