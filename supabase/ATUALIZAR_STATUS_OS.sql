-- ==============================================================================
-- CH CELL PRO — ATUALIZAÇÃO DA CONSTRAINT DE STATUS DA TABELA ORDENS_SERVICO
-- Adiciona 'Pago e Entregue' e mantém todos os status anteriores
-- ==============================================================================

-- 1. Remove a restrição antiga (se existir)
ALTER TABLE public.ordens_servico 
DROP CONSTRAINT IF EXISTS ordens_servico_status_check;

-- 2. Adiciona a nova restrição contemplando todos os status do sistema
ALTER TABLE public.ordens_servico 
ADD CONSTRAINT ordens_servico_status_check 
CHECK (status IN (
    'Em Análise',
    'Aguardando Peças',
    'Em Serviço',
    'Finalizado',
    'Pago e Entregue',
    'Entregue',
    'Aprovado',
    'Cancelado'
));

-- 3. Mensagem de confirmação
SELECT 'Constraint ordens_servico_status_check atualizada com sucesso no Supabase!' AS resultado;
