import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  dose: number;
  unit: "L/ha" | "kg/ha";
}

export interface CalculationResult {
  totalWater: number;
  totalTanks: number;
  productQuantities: { name: string; totalQuantity: number; quantityPerTank: number; unit: string }[];
}

export interface SprayCalculation {
  id: string;
  name: string;
  area: number;
  sprayRate: number;
  tankVolume: number;
  products: Product[];
  results: CalculationResult;
  createdAt: string;
}

export const useSprayCalculations = () => {
  const [calculations, setCalculations] = useState<SprayCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar cálculos do Supabase
  const fetchCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from('spray_calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCalculations = data.map(calc => ({
        id: calc.id,
        name: calc.name,
        area: calc.area,
        sprayRate: calc.spray_rate,
        tankVolume: calc.tank_volume,
        products: (calc.products as any) || [],
        results: (calc.results as any) || { totalWater: 0, totalTanks: 0, productQuantities: [] },
        createdAt: new Date(calc.created_at).toISOString().split('T')[0]
      }));

      setCalculations(formattedCalculations);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cálculos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar cálculo
  const saveCalculation = async (
    name: string,
    area: number,
    sprayRate: number,
    tankVolume: number,
    products: Product[],
    results: CalculationResult
  ) => {
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
        name,
        area,
        spray_rate: sprayRate,
        tank_volume: tankVolume,
        products: products as any,
        results: results as any,
        user_id: userData.user.id
      };

      const result = await supabase
        .from('spray_calculations')
        .insert(dbData)
        .select()
        .single();

      if (result.error) throw result.error;

      // Atualizar lista local
      await fetchCalculations();
      
      toast({
        title: "Sucesso",
        description: "Cálculo salvo com sucesso!"
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cálculo",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Deletar cálculo
  const deleteCalculation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('spray_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCalculations(calculations.filter(calc => calc.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Cálculo removido!"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover cálculo",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, []);

  return {
    calculations,
    loading,
    saveCalculation,
    deleteCalculation,
    refetch: fetchCalculations
  };
};