import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  type: "tarefa" | "servico" | "visita" | "suporte";
  title: string;
  description: string;
  date: string;
  time: string;
  end_time?: string;
  responsible: string;
  client?: string;
  location?: string;
  status: "pendente" | "andamento" | "concluida";
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar compromissos do Supabase
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Formato de tempo do Supabase (HH:MM:SS) para input HTML (HH:MM)
      const formatTimeFromDB = (time: string) => {
        if (!time) return "";
        return time.split(':').slice(0, 2).join(':');
      };

      const formattedAppointments = data.map(apt => ({
        id: apt.id,
        type: apt.type as Appointment["type"],
        title: apt.title,
        description: apt.description || "",
        date: apt.date,
        time: formatTimeFromDB(apt.time),
        end_time: apt.end_time ? formatTimeFromDB(apt.end_time) : undefined,
        responsible: apt.responsible,
        client: apt.client,
        location: apt.location,
        status: apt.status as Appointment["status"]
      }));

      setAppointments(formattedAppointments);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar compromisso
  const saveAppointment = async (appointmentData: Omit<Appointment, 'id'> & { id?: string }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Erro de autenticação",
          description: "Faça login para continuar",
          variant: "destructive"
        });
        return false;
      }

      // Formato de tempo para Supabase (HH:MM:SS)
      const formatTimeForDB = (time: string) => {
        if (!time) return null;
        return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
      };

      const dbData = {
        type: appointmentData.type,
        title: appointmentData.title,
        description: appointmentData.description,
        date: appointmentData.date,
        time: formatTimeForDB(appointmentData.time),
        end_time: appointmentData.end_time ? formatTimeForDB(appointmentData.end_time) : null,
        responsible: appointmentData.responsible,
        client: appointmentData.client,
        location: appointmentData.location,
        status: appointmentData.status,
        user_id: userData.user.id
      };

      let result;
      if (appointmentData.id) {
        // Atualizar
        result = await supabase
          .from('appointments')
          .update(dbData)
          .eq('id', appointmentData.id)
          .select()
          .single();
      } else {
        // Criar novo
        result = await supabase
          .from('appointments')
          .insert(dbData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Atualizar lista local
      await fetchAppointments();
      
      toast({
        title: "Sucesso",
        description: appointmentData.id ? "Agendamento atualizado!" : "Agendamento criado!"
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar agendamento",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Deletar compromisso
  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(appointments.filter(apt => apt.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Agendamento removido!"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover agendamento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    saveAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  };
};