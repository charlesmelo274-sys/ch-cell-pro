-- ==============================================================================
-- CH CELL PRO — ALTERAR COLUNA NUMERO PARA TEXT NA TABELA ORDENS_SERVICO
-- Permite armazenar códigos alfanuméricos como 'EM5GL' sem erro de bigint
-- ==============================================================================

-- 1. Remove qualquer restrição de IDENTITY da coluna numero
ALTER TABLE public.ordens_servico ALTER COLUMN numero DROP IDENTITY IF EXISTS;

-- 2. Converte a coluna numero de BIGINT para TEXT
ALTER TABLE public.ordens_servico ALTER COLUMN numero TYPE TEXT USING numero::text;

-- 3. Garante que pode receber valores nulos ou gerados pelo frontend
ALTER TABLE public.ordens_servico ALTER COLUMN numero DROP NOT NULL;

-- 4. Confirmação
SELECT 'Coluna numero alterada com sucesso para TEXT! Agora aceita qualquer código alfanumérico.' AS resultado;
