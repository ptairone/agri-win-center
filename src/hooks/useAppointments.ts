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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Se não houver usuário logado, limpar lista e finalizar
      if (!userData.user) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      // Formato de tempo do Supabase (HH:MM:SS) para input HTML (HH:MM)
      const formatTimeFromDB = (time: string) => {
        if (!time) return "";
        return time.split(':').slice(0, 2).join(':');
      };

      const formattedAppointments = (data || []).map(apt => ({
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

      // Atualizar lista local removendo o item deletado
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      
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
    
    // Configurar realtime para notificações
    const channel = supabase
      .channel('appointments_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          const newAppointment = payload.new as any;
          
          // Só mostrar notificação se não foi o usuário atual que criou
          supabase.auth.getUser().then(({ data: userData }) => {
            if (userData.user && newAppointment.user_id !== userData.user.id) {
              toast({
                title: "Novo Agendamento",
                description: `${newAppointment.title} foi agendado para ${new Date(newAppointment.date).toLocaleDateString('pt-BR')} às ${newAppointment.time.slice(0, 5)}`,
              });
            }
          });
          
          // Atualizar lista local
          fetchAppointments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          const updatedAppointment = payload.new as any;
          
          // Só mostrar notificação se não foi o usuário atual que atualizou
          supabase.auth.getUser().then(({ data: userData }) => {
            if (userData.user && updatedAppointment.user_id !== userData.user.id) {
              toast({
                title: "Agendamento Atualizado",
                description: `${updatedAppointment.title} foi atualizado`,
              });
            }
          });
          
          // Atualizar lista local
          fetchAppointments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          const deletedAppointment = payload.old as any;
          
          // Só mostrar notificação se não foi o usuário atual que deletou
          supabase.auth.getUser().then(({ data: userData }) => {
            if (userData.user && deletedAppointment.user_id !== userData.user.id) {
              toast({
                title: "Agendamento Removido",
                description: `${deletedAppointment.title} foi removido`,
              });
            }
          });
          
          // Atualizar lista local
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    appointments,
    loading,
    saveAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  };
};