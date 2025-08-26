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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Plus, Trash2, Download, Eye, Calendar, MapPin, Camera, FileVideo, FileImage, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { createFlight, flights, isLoading, uploadAttachment, updateFlightAttachments } = useDroneFlights();
  const { toast } = useToast();
  const [liquidProducts, setLiquidProducts] = useState<Product[]>([{ name: "", dosage: 0, unit: "L/ha" }]);
  const [solidProducts, setSolidProducts] = useState<Product[]>([{ name: "", dosage: 0, unit: "kg/ha" }]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("new-flight");

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB max
      
      if (!isValidType) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas imagens e vídeos são permitidos.",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 50MB.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (type.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    return <Camera className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    try {
      const newFlight = await createFlight(flightData);
      
      // Upload attached files if any
      if (attachedFiles.length > 0 && newFlight?.id && uploadAttachment) {
        const uploadedFiles = [];
        for (const file of attachedFiles) {
          try {
            const uploadedFile = await uploadAttachment(file, newFlight.id);
            if (uploadedFile) {
              uploadedFiles.push(uploadedFile);
            }
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }
        
        // Update flight with attachments if any were uploaded
        if (uploadedFiles.length > 0 && updateFlightAttachments) {
          await updateFlightAttachments(newFlight.id, uploadedFiles);
        }
      }
      
      // Reset form
      form.reset();
      setLiquidProducts([{ name: "", dosage: 0, unit: "L/ha" }]);
      setSolidProducts([{ name: "", dosage: 0, unit: "kg/ha" }]);
      setAttachedFiles([]);
      
      // Switch to history tab
      setActiveTab("history");
    } catch (error) {
      console.error('Error creating flight:', error);
    }
  };

  const exportToCSV = () => {
    if (!flights || flights.length === 0) return;

    const headers = [
      "Data",
      "Cultura",
      "Altura (m)",
      "Velocidade (m/s)",
      "Faixa (m)",
      "Tipo de Gota",
      "Vazão (L/min)",
      "Área (ha)",
      "Volume Total (L)",
      "Produtos Líquidos",
      "Produtos Sólidos",
      "Condições Climáticas",
      "Observações"
    ];

    const csvContent = [
      headers.join(","),
      ...flights.map(flight => {
        const liquidProducts = Array.isArray(flight.products) 
          ? flight.products.map((p: any) => `${p.name} (${p.dosage}${p.unit})`).join("; ") 
          : "";
        const solidProducts = Array.isArray(flight.solid_products) 
          ? flight.solid_products.map((p: any) => `${p.name} (${p.dosage}${p.unit})`).join("; ") 
          : "";

        return [
          new Date(flight.flight_date).toLocaleDateString('pt-BR'),
          flight.culture,
          flight.flight_height,
          flight.speed,
          flight.application_width,
          flight.droplet_type,
          flight.flow_rate,
          flight.area_covered || "",
          flight.total_volume || "",
          `"${liquidProducts}"`,
          `"${solidProducts}"`,
          `"${flight.weather_conditions || ""}"`,
          `"${flight.notes || ""}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historico-voos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-flight">Novo Voo</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="new-flight">
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

              <Separator />

              {/* Seção de Upload de Arquivos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Fotos e Vídeos</h3>
                    <p className="text-sm text-muted-foreground">
                      anexe fotos ou vídeos do registro de voo (máx. 50MB por arquivo)
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Anexar Arquivo
                  </Button>
                </div>
                
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Lista de arquivos anexados */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Arquivos Anexados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Salvando..." : "Salvar Registro de Voo"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Histórico Completo</h2>
                <p className="text-muted-foreground">
                  {flights?.length || 0} voo(s) registrado(s)
                </p>
              </div>
              <Button onClick={exportToCSV} disabled={!flights || flights.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {flights && flights.length > 0 ? (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <Card key={flight.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header do voo */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              {flight.culture}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(flight.flight_date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {flight.droplet_type}
                          </Badge>
                        </div>

                        <Separator />

                        {/* Parâmetros técnicos */}
                        <div>
                          <h4 className="font-medium mb-3">Parâmetros Técnicos</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Altura de Voo</p>
                              <p className="font-medium">{flight.flight_height}m</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Velocidade</p>
                              <p className="font-medium">{flight.speed}m/s</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Faixa de Aplicação</p>
                              <p className="font-medium">{flight.application_width}m</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Vazão</p>
                              <p className="font-medium">{flight.flow_rate}L/min</p>
                            </div>
                          </div>
                        </div>

                        {/* Área e Volume */}
                        {(flight.area_covered || flight.total_volume) && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Área e Volume</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {flight.area_covered && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Área Coberta</p>
                                    <p className="font-medium">{flight.area_covered}ha</p>
                                  </div>
                                )}
                                {flight.total_volume && (
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Volume Total</p>
                                    <p className="font-medium">{flight.total_volume}L</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Produtos Aplicados */}
                        {((Array.isArray(flight.products) && flight.products.length > 0) || 
                          (Array.isArray(flight.solid_products) && flight.solid_products.length > 0)) && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Produtos Aplicados</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.isArray(flight.products) && flight.products.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Produtos Líquidos</h5>
                                    <div className="space-y-2">
                                      {flight.products.map((product: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center bg-muted/50 rounded-lg p-2">
                                          <span className="font-medium">{product.name}</span>
                                          <Badge variant="outline">
                                            {product.dosage}{product.unit}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {Array.isArray(flight.solid_products) && flight.solid_products.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Produtos Sólidos</h5>
                                    <div className="space-y-2">
                                      {flight.solid_products.map((product: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center bg-muted/50 rounded-lg p-2">
                                          <span className="font-medium">{product.name}</span>
                                          <Badge variant="outline">
                                            {product.dosage}{product.unit}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Condições e Observações */}
                        {(flight.weather_conditions || flight.notes) && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Informações Adicionais</h4>
                              <div className="space-y-3">
                                {flight.weather_conditions && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Condições Climáticas</p>
                                    <p className="mt-1">{flight.weather_conditions}</p>
                                  </div>
                                )}
                                {flight.notes && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Observações</p>
                                    <p className="mt-1">{flight.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Arquivos Anexados */}
                        {Array.isArray(flight.attachments) && flight.attachments.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3">Fotos e Vídeos</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {flight.attachments.map((attachment: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                      {getFileIcon(attachment.type)}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(attachment.url, '_blank')}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-muted rounded-full p-3">
                      <Plane className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Nenhum voo registrado</h3>
                      <p className="text-muted-foreground">
                        Adicione seu primeiro registro de voo na aba "Novo Voo"
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("new-flight")} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Voo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DroneHistory;