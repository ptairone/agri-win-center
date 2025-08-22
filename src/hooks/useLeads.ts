import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  farm: string;
  city: string;
  state: string;
  status: "frio" | "morno" | "quente";
  hectares: number;
  mainCrop: string;
  otherCrops: string;
  notes: string;
  createdAt: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar leads do Supabase
  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeads = data.map(lead => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        farm: lead.farm || "",
        city: lead.city || "",
        state: lead.state || "",
        status: lead.status as Lead["status"],
        hectares: lead.hectares || 0,
        mainCrop: lead.main_crop || "",
        otherCrops: lead.other_crops || "",
        notes: lead.notes || "",
        createdAt: new Date(lead.created_at).toISOString().split('T')[0]
      }));

      setLeads(formattedLeads);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar leads",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar lead
  const saveLead = async (leadData: Omit<Lead, 'id' | 'createdAt'> & { id?: string }) => {
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

      const dbData = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        farm: leadData.farm,
        city: leadData.city,
        state: leadData.state,
        status: leadData.status,
        hectares: leadData.hectares,
        main_crop: leadData.mainCrop,
        other_crops: leadData.otherCrops,
        notes: leadData.notes,
        user_id: userData.user.id
      };

      let result;
      if (leadData.id) {
        // Atualizar
        result = await supabase
          .from('leads')
          .update(dbData)
          .eq('id', leadData.id)
          .select()
          .single();
      } else {
        // Criar novo
        result = await supabase
          .from('leads')
          .insert(dbData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Atualizar lista local
      await fetchLeads();
      
      toast({
        title: "Sucesso",
        description: leadData.id ? "Lead atualizado!" : "Lead cadastrado!"
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar lead",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Deletar lead
  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(leads.filter(lead => lead.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Lead removido!"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover lead",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    loading,
    saveLead,
    deleteLead,
    refetch: fetchLeads
  };
};