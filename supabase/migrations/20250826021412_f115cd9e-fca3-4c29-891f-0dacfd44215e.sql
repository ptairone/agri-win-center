-- Adicionar coluna para arquivos anexos na tabela drone_flights
ALTER TABLE public.drone_flights 
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

-- Criar bucket para arquivos de voos de drone
INSERT INTO storage.buckets (id, name, public) 
VALUES ('drone-attachments', 'drone-attachments', false);

-- Políticas para o bucket drone-attachments
CREATE POLICY "Usuários podem ver seus próprios arquivos de voo" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'drone-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem fazer upload de seus próprios arquivos de voo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'drone-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus próprios arquivos de voo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'drone-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);