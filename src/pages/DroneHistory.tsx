import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDroneFlights } from "@/hooks/useDroneFlights";
import type { DroneFlightData } from "@/hooks/useDroneFlights";
import { Separator } from "@/components/ui/separator";
import { Plane, Plus, Trash2 } from "lucide-react";

const flightSchema = z.object({
  flight_date: z.string(),
  culture: z.string().min(1, "Cultura é obrigatória"),
  flight_height: z.number().min(0.1, "Altura deve ser maior que 0"),
  speed: z.number().min(0.1, "Velocidade deve ser maior que 0"),
  application_width: z.number().min(0.1, "Faixa de aplicação deve ser maior que 0"),
  droplet_type: z.string().min(1, "Tipo de gota é obrigatório"),
  flow_rate: z.number().min(0.1, "Vazão deve ser maior que 0"),
  area_covered: z.number().optional(),
  total_volume: z.number().optional(),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
});

interface Product {
  name: string;
  dosage: number;
  unit: string;
}

const DroneHistory = () => {
  const { createFlight, flights, isLoading } = useDroneFlights();
  const [liquidProducts, setLiquidProducts] = useState<Product[]>([{ name: "", dosage: 0, unit: "L/ha" }]);
  const [solidProducts, setSolidProducts] = useState<Product[]>([{ name: "", dosage: 0, unit: "kg/ha" }]);

  const form = useForm<z.infer<typeof flightSchema>>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flight_date: new Date().toISOString().split('T')[0],
      culture: "",
      flight_height: 3,
      speed: 5,
      application_width: 4,
      droplet_type: "",
      flow_rate: 1,
      area_covered: 0,
      total_volume: 0,
      weather_conditions: "",
      notes: "",
    },
  });

  const addProduct = (type: 'liquid' | 'solid') => {
    if (type === 'liquid') {
      setLiquidProducts([...liquidProducts, { name: "", dosage: 0, unit: "L/ha" }]);
    } else {
      setSolidProducts([...solidProducts, { name: "", dosage: 0, unit: "kg/ha" }]);
    }
  };

  const removeProduct = (type: 'liquid' | 'solid', index: number) => {
    if (type === 'liquid') {
      setLiquidProducts(liquidProducts.filter((_, i) => i !== index));
    } else {
      setSolidProducts(solidProducts.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (type: 'liquid' | 'solid', index: number, field: keyof Product, value: string | number) => {
    if (type === 'liquid') {
      const updated = [...liquidProducts];
      updated[index] = { ...updated[index], [field]: value };
      setLiquidProducts(updated);
    } else {
      const updated = [...solidProducts];
      updated[index] = { ...updated[index], [field]: value };
      setSolidProducts(updated);
    }
  };

  const onSubmit = async (data: z.infer<typeof flightSchema>) => {
    const flightData: DroneFlightData = {
      flight_date: data.flight_date,
      culture: data.culture,
      flight_height: data.flight_height,
      speed: data.speed,
      application_width: data.application_width,
      droplet_type: data.droplet_type,
      flow_rate: data.flow_rate,
      area_covered: data.area_covered,
      total_volume: data.total_volume,
      weather_conditions: data.weather_conditions,
      notes: data.notes,
      products: liquidProducts.filter(p => p.name.trim() !== ""),
      solid_products: solidProducts.filter(p => p.name.trim() !== ""),
    };

    await createFlight(flightData);
    
    // Reset form
    form.reset();
    setLiquidProducts([{ name: "", dosage: 0, unit: "L/ha" }]);
    setSolidProducts([{ name: "", dosage: 0, unit: "kg/ha" }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-hero p-2 rounded-lg">
          <Plane className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Histórico de Voos</h1>
          <p className="text-muted-foreground">Registre os parâmetros das operações com drone agrícola</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Registro de Voo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="flight_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Voo</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="culture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cultura</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Soja, Milho, Algodão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flight_height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura de Voo (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velocidade (m/s)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="application_width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa de Aplicação (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="droplet_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Gota</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de gota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="muito-fina">Muito Fina</SelectItem>
                          <SelectItem value="fina">Fina</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="grossa">Grossa</SelectItem>
                          <SelectItem value="muito-grossa">Muito Grossa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flow_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vazão (L/min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area_covered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Coberta (ha)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Produtos Líquidos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Produtos Líquidos</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addProduct('liquid')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
                
                {liquidProducts.map((product, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div>
                      <Label>Nome do Produto</Label>
                      <Input 
                        placeholder="Ex: Herbicida, Fungicida"
                        value={product.name}
                        onChange={e => updateProduct('liquid', index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dosagem</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={product.dosage}
                        onChange={e => updateProduct('liquid', index, 'dosage', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Select 
                        value={product.unit} 
                        onValueChange={value => updateProduct('liquid', index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L/ha">L/ha</SelectItem>
                          <SelectItem value="mL/ha">mL/ha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeProduct('liquid', index)}
                      disabled={liquidProducts.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Produtos Sólidos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Produtos Sólidos</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addProduct('solid')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
                
                {solidProducts.map((product, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div>
                      <Label>Nome do Produto</Label>
                      <Input 
                        placeholder="Ex: Fertilizante, Sementes"
                        value={product.name}
                        onChange={e => updateProduct('solid', index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dosagem</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={product.dosage}
                        onChange={e => updateProduct('solid', index, 'dosage', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Select 
                        value={product.unit} 
                        onValueChange={value => updateProduct('solid', index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg/ha">kg/ha</SelectItem>
                          <SelectItem value="g/ha">g/ha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeProduct('solid', index)}
                      disabled={solidProducts.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume Total Aplicado (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weather_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições Climáticas</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ensolarado, vento fraco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre o voo..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Salvando..." : "Salvar Registro de Voo"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Lista de voos salvos */}
      {flights && flights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Voos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flights.map((flight) => (
                <div key={flight.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{flight.culture}</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(flight.flight_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <div>Altura: {flight.flight_height}m</div>
                    <div>Velocidade: {flight.speed}m/s</div>
                    <div>Faixa: {flight.application_width}m</div>
                    <div>Vazão: {flight.flow_rate}L/min</div>
                  </div>
                  {flight.area_covered && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Área: {flight.area_covered}ha
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DroneHistory;