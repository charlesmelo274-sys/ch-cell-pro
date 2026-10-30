-- ==============================================================================
-- CH CELL PRO — CRIAÇÃO E LIBERAÇÃO DAS TABELAS: FORNECEDORES, EBOOKS E VIDEOAULAS
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- Cria as tabelas para salvar e sincronizar 100% entre PC, Celular e Nuvem
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

-- 2. Tabela de eBooks & Esquemas Elétricos
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

-- 3. Tabela de Videoaulas & Treinamentos Técnicos
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

-- 4. Habilitar RLS e criar políticas totalmente liberadas para anon e authenticated
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videoaulas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fornecedores_open" ON public.fornecedores;
CREATE POLICY "fornecedores_open" ON public.fornecedores FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ebooks_open" ON public.ebooks;
CREATE POLICY "ebooks_open" ON public.ebooks FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "videoaulas_open" ON public.videoaulas;
CREATE POLICY "videoaulas_open" ON public.videoaulas FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.fornecedores TO anon, authenticated, service_role;
GRANT ALL ON public.ebooks TO anon, authenticated, service_role;
GRANT ALL ON public.videoaulas TO anon, authenticated, service_role;

-- 5. Inserir fornecedores padrão se a tabela estiver vazia
INSERT INTO public.fornecedores (id, nome, marca, especialidade, telefone, whatsapp, endereco, site, observacoes)
SELECT 'forn_1', 'MegaTelas Distribuidora', 'Apple, Samsung, Motorola, Xiaomi', 'Telas OLED Originais & Baterias Seladas', '(11) 3222-1010', '11988881234', 'Rua Santa Ifigênia, 280 - São Paulo, SP', 'https://megatelasdistribuidora.com.br', 'Garantia de 90 dias com selo intacto. Despacho no mesmo dia via Sedex até 16h.'
WHERE NOT EXISTS (SELECT 1 FROM public.fornecedores LIMIT 1);

INSERT INTO public.fornecedores (id, nome, marca, especialidade, telefone, whatsapp, endereco, site, observacoes)
SELECT 'forn_2', 'ChipMaster Componentes & Ferramentas', 'Apple, Xiaomi, Motorola, Samsung', 'CIs de Carga Tristar/Hydra, PMIC, Estações e Microscópios', '(19) 3456-7890', '19997778899', 'Campinas, SP', 'https://chipmasterpecas.com.br', 'Pedido mínimo R$ 200. Componentes SMD originais em fita carretel.'
WHERE NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE id = 'forn_2');

INSERT INTO public.fornecedores (id, nome, marca, especialidade, telefone, whatsapp, endereco, site, observacoes)
SELECT 'forn_3', 'FlashCell Atacado de Vidros e Peças', 'Samsung, Motorola, Xiaomi, Realme', 'Vidros com Cola OCA, Carcaças e Conectores Tipo-C', '(21) 2555-4321', '21996665544', 'Centro, Rio de Janeiro - RJ', 'https://flashcellatacado.com.br', 'Frete grátis para compras acima de R$ 600. Troca expressa no balcão.'
WHERE NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE id = 'forn_3');

-- 6. Inserir eBooks padrão se a tabela estiver vazia
INSERT INTO public.ebooks (id, titulo, marca, modelo, categoria, url, descricao)
SELECT 'ebk_1', 'Guia de Diagnóstico & Esquema Elétrico iPhone 13 / 13 Pro', 'Apple', 'iPhone 13 / 13 Pro / 13 Pro Max', 'Esquema Elétrico', 'https://archive.org/details/schematics-sample', 'Mapeamento detalhado de linhas primárias VDD_MAIN, circuito do Tristar/Hydra, barramentos I2C e teste de tensões com multímetro.'
WHERE NOT EXISTS (SELECT 1 FROM public.ebooks LIMIT 1);

INSERT INTO public.ebooks (id, titulo, marca, modelo, categoria, url, descricao)
SELECT 'ebk_2', 'Manual de Serviço & Boardview Samsung Linha Galaxy S22', 'Samsung', 'Galaxy S22 / S22 Ultra (Exynos & Snapdragon)', 'Manual de Serviço', 'https://archive.org/details/manual-servico-samsung', 'Diagrama de blocos, guia de testes de desoxidação, diagrama do sensor Hall e circuitos de RF 5G.'
WHERE NOT EXISTS (SELECT 1 FROM public.ebooks WHERE id = 'ebk_2');

INSERT INTO public.ebooks (id, titulo, marca, modelo, categoria, url, descricao)
SELECT 'ebk_3', 'Apostila Completa de Microsoldagem e Injeção de Tensão na Prática', 'Multimarcas', 'Universal (Smartphones Android & iOS)', 'Microsoldagem', 'https://archive.org/details/apostila-microsoldagem', 'Técnicas de remoção de resina epóxi, reballing com stencil 3D, temperatura ideal de soprador térmico e reconstrução de pads rompidos.'
WHERE NOT EXISTS (SELECT 1 FROM public.ebooks WHERE id = 'ebk_3');

-- 7. Inserir Videoaulas padrão se a tabela estiver vazia
INSERT INTO public.videoaulas (id, titulo, marca, modelo, categoria, url, descricao)
SELECT 'vid_1', 'Como Localizar Curto em Linha Primária com Câmera Térmica e Breu', 'Apple', 'iPhone 11 / 12 / 13', 'Microsoldagem', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Passo a passo com fonte de bancada ajustada em 4.0V e 2A. Demonstração de dissipação térmica com método do breu e detecção instantânea do capacitor em curto.'
WHERE NOT EXISTS (SELECT 1 FROM public.videoaulas LIMIT 1);

INSERT INTO public.videoaulas (id, titulo, marca, modelo, categoria, url, descricao)
SELECT 'vid_2', 'Troca de Vidro na Máquina OCA sem Risco de Mancha no Polarizer', 'Samsung', 'Linha Galaxy A e Linha S', 'Troca de Vidro / OCA', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Aquecimento na separadora a 85°C, uso de fio de molibdênio 0.03mm, limpeza com removedor de cola 530 e laminação precisa na câmara de vácuo.'
WHERE NOT EXISTS (SELECT 1 FROM public.videoaulas WHERE id = 'vid_2');

INSERT INTO public.videoaulas (id, titulo, marca, modelo, categoria, url, descricao)
SELECT 'vid_3', 'Diagnóstico Avançado de Falha de Carga no Motorola (PMIC / IF-PMIC)', 'Motorola', 'Moto G60 / Moto G84', 'Diagnóstico de Carga', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Teste no USB tester (Dongle USB). Como identificar se a falha é no conector Sub-placa, no flat FPC ou no circuito de chaveamento OVP da placa mãe.'
WHERE NOT EXISTS (SELECT 1 FROM public.videoaulas WHERE id = 'vid_3');

SELECT 'Tabelas fornecedores, ebooks e videoaulas criadas e liberadas com sucesso!' AS status;
