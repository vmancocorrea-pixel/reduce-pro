-- Agrega el estado eliminado para productos borrados de forma lógica.
ALTER TYPE public.product_status ADD VALUE IF NOT EXISTS 'eliminado';
