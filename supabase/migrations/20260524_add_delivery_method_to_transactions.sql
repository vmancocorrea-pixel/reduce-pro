-- Agrega campo delivery_method a transactions para registrar cómo desea recibir el consumidor
ALTER TABLE public.transactions
ADD COLUMN delivery_method TEXT DEFAULT 'tienda';

-- Crear constraint si es necesario para valores válidos
ALTER TABLE public.transactions
ADD CONSTRAINT check_delivery_method CHECK (delivery_method IN ('domicilio', 'tienda'));
