-- Criar tabela para histórico de voos de drone agrícola
CREATE TABLE public.drone_flights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flight_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Parâmetros da operação
  culture TEXT NOT NULL,
  flight_height NUMERIC NOT NULL, -- em metros
  speed NUMERIC NOT NULL, -- em m/s ou km/h
  application_width NUMERIC NOT NULL, -- faixa de aplicação em metros
  droplet_type TEXT NOT NULL, -- tipo de gota (fina, média, grossa)
  flow_rate NUMERIC NOT NULL, -- vazão em L/min
  
  -- Produtos utilizados
  products JSONB NOT NULL DEFAULT '[]', -- array de produtos líquidos
  solid_products JSONB NOT NULL DEFAULT '[]', -- array de produtos sólidos
  
  -- Informações adicionais
  area_covered NUMERIC, -- área coberta em hectares
  total_volume NUMERIC, -- volume total aplicado
  weather_conditions TEXT, -- condições climáticas
  notes TEXT, -- observações gerais
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.drone_flights ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários podem ver seus próprios voos" 
ON public.drone_flights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios voos" 
ON public.drone_flights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios voos" 
ON public.drone_flights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios voos" 
ON public.drone_flights 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_drone_flights_updated_at
  BEFORE UPDATE ON public.drone_flights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();