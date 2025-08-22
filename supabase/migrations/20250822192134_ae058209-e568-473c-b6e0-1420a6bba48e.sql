-- Ativar realtime para a tabela appointments
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Adicionar a tabela appointments à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;