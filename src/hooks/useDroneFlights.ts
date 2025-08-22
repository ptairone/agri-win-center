import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface DroneFlightData {
  flight_date: string;
  culture: string;
  flight_height: number;
  speed: number;
  application_width: number;
  droplet_type: string;
  flow_rate: number;
  area_covered?: number;
  total_volume?: number;
  weather_conditions?: string;
  notes?: string;
  products: Array<{
    name: string;
    dosage: number;
    unit: string;
  }>;
  solid_products: Array<{
    name: string;
    dosage: number;
    unit: string;
  }>;
}

interface DroneFlightRecord {
  id: string;
  user_id: string;
  flight_date: string;
  culture: string;
  flight_height: number;
  speed: number;
  application_width: number;
  droplet_type: string;
  flow_rate: number;
  area_covered?: number | null;
  total_volume?: number | null;
  weather_conditions?: string | null;
  notes?: string | null;
  products: any; // Json type from Supabase
  solid_products: any; // Json type from Supabase
  created_at: string;
  updated_at: string;
}

export const useDroneFlights = () => {
  const [flights, setFlights] = useState<DroneFlightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchFlights = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("drone_flights")
        .select("*")
        .order("flight_date", { ascending: false });

      if (error) throw error;

      setFlights((data || []) as DroneFlightRecord[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFlight = async (flightData: DroneFlightData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("drone_flights")
        .insert([
          {
            ...flightData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Voo registrado!",
        description: "O histórico do voo foi salvo com sucesso.",
      });

      // Atualizar a lista local
      setFlights(prev => [data as DroneFlightRecord, ...prev]);

      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar voo",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlight = async (id: string, flightData: Partial<DroneFlightData>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("drone_flights")
        .update(flightData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Voo atualizado!",
        description: "As informações do voo foram atualizadas.",
      });

      // Atualizar a lista local
      setFlights(prev => 
        prev.map(flight => 
          flight.id === id ? { ...flight, ...data } as DroneFlightRecord : flight
        )
      );

      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar voo",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlight = async (id: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("drone_flights")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Voo removido!",
        description: "O registro do voo foi removido do histórico.",
      });

      // Atualizar a lista local
      setFlights(prev => prev.filter(flight => flight.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao remover voo",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [user]);

  return {
    flights,
    isLoading,
    createFlight,
    updateFlight,
    deleteFlight,
    refetch: fetchFlights,
  };
};