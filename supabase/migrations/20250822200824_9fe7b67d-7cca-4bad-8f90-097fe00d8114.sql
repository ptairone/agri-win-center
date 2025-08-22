-- Atualizar a política de visualização para permitir que todos vejam todos os agendamentos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios agendamentos" ON appointments;

CREATE POLICY "Todos podem ver todos os agendamentos" 
ON appointments 
FOR SELECT 
USING (true);