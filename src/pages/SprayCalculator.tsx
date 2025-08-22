import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Calculator, Save, History } from "lucide-react";
import { useSprayCalculations, type Product, type CalculationResult } from "@/hooks/useSprayCalculations";
import { useToast } from "@/hooks/use-toast";

const SprayCalculator = () => {
  const { calculations, loading, saveCalculation, deleteCalculation } = useSprayCalculations();
  const { toast } = useToast();
  
  const [area, setArea] = useState<number>(0);
  const [sprayRate, setSprayRate] = useState<number>(200);
  const [tankVolume, setTankVolume] = useState<number>(2000);
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "", dose: 0, unit: "L/ha" }
  ]);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [calculationName, setCalculationName] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "",
      dose: 0,
      unit: "L/ha"
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const calculate = () => {
    if (area <= 0 || sprayRate <= 0 || tankVolume <= 0) return;

    const totalWater = area * sprayRate; // Total de água necessária em litros
    const totalTanks = Math.ceil(totalWater / tankVolume); // Número de tanques necessários
    
    const productQuantities = products
      .filter(product => product.name && product.dose > 0)
      .map(product => {
        const totalQuantity = area * product.dose; // Quantidade total do produto
        const quantityPerTank = totalQuantity / totalTanks; // Quantidade por tanque
        
        return {
          name: product.name,
          totalQuantity: Math.round(totalQuantity * 100) / 100,
          quantityPerTank: Math.round(quantityPerTank * 100) / 100,
          unit: product.unit
        };
      });

    setResults({
      totalWater: Math.round(totalWater),
      totalTanks,
      productQuantities
    });
  };

  const handleSaveCalculation = async () => {
    if (!calculationName.trim() || !results) {
      toast({
        title: "Erro",
        description: "Preencha o nome do cálculo e execute o cálculo primeiro",
        variant: "destructive"
      });
      return;
    }

    const success = await saveCalculation(calculationName, area, sprayRate, tankVolume, products, results);
    if (success) {
      setIsSaveDialogOpen(false);
      setCalculationName("");
    }
  };

  const loadCalculation = (calculation: any) => {
    setArea(calculation.area);
    setSprayRate(calculation.sprayRate);
    setTankVolume(calculation.tankVolume);
    setProducts(calculation.products);
    setResults(calculation.results);
    setIsHistoryOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Cálculo carregado!"
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Calculadora de Calda</h1>
        <p className="text-muted-foreground">Calcule a quantidade de produtos e água para pulverização</p>
        <div className="flex justify-center gap-4 mt-4">
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Histórico de Cálculos</DialogTitle>
                <DialogDescription>Seus cálculos salvos anteriormente</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {calculations.map((calc) => (
                  <Card key={calc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => loadCalculation(calc)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{calc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {calc.area} ha • {calc.results.totalTanks} tanques • {calc.createdAt}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCalculation(calc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {calculations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum cálculo salvo ainda</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Dados da Aplicação</span>
            </CardTitle>
            <CardDescription>Insira os dados para calcular a calda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Área */}
            <div className="space-y-2">
              <Label htmlFor="area">Área a ser aplicada (ha)</Label>
              <Input
                id="area"
                type="number"
                value={area || ""}
                onChange={(e) => setArea(Number(e.target.value))}
                placeholder="Ex: 50"
                min="0"
                step="0.1"
              />
            </div>

            {/* Vazão */}
            <div className="space-y-2">
              <Label htmlFor="sprayRate">Vazão do pulverizador (L/ha)</Label>
              <Input
                id="sprayRate"
                type="number"
                value={sprayRate || ""}
                onChange={(e) => setSprayRate(Number(e.target.value))}
                placeholder="Ex: 200"
                min="0"
              />
            </div>

            {/* Volume do tanque */}
            <div className="space-y-2">
              <Label htmlFor="tankVolume">Volume do tanque (L)</Label>
              <Input
                id="tankVolume"
                type="number"
                value={tankVolume || ""}
                onChange={(e) => setTankVolume(Number(e.target.value))}
                placeholder="Ex: 2000"
                min="0"
              />
            </div>

            <Separator />

            {/* Produtos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Produtos</Label>
                <Button onClick={addProduct} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {products.map((product, index) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Produto {index + 1}</span>
                    {products.length > 1 && (
                      <Button
                        onClick={() => removeProduct(product.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      placeholder="Nome do produto"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Dose"
                        value={product.dose || ""}
                        onChange={(e) => updateProduct(product.id, "dose", Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={product.unit}
                        onChange={(e) => updateProduct(product.id, "unit", e.target.value as "L/ha" | "kg/ha")}
                        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      >
                        <option value="L/ha">L/ha</option>
                        <option value="kg/ha">kg/ha</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={calculate} className="flex-1" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Calda
              </Button>
              {results && (
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Salvar Cálculo</DialogTitle>
                      <DialogDescription>
                        Dê um nome ao seu cálculo para salvá-lo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="calculation-name">Nome do Cálculo</Label>
                        <Input
                          id="calculation-name"
                          value={calculationName}
                          onChange={(e) => setCalculationName(e.target.value)}
                          placeholder="Ex: Aplicação Soja Safra 2024"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveCalculation}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Quantidades calculadas para a aplicação</CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                {/* Resumo geral */}
                <div className="p-4 bg-gradient-field rounded-lg">
                  <h3 className="font-semibold mb-3">Resumo da Aplicação</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Área total:</span>
                      <span className="font-medium">{area} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Água total necessária:</span>
                      <span className="font-medium">{results.totalWater.toLocaleString()} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Número de tanques:</span>
                      <span className="font-medium">{results.totalTanks}</span>
                    </div>
                  </div>
                </div>

                {/* Produtos */}
                {results.productQuantities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Produtos</h3>
                    <div className="space-y-3">
                      {results.productQuantities.map((product, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h4 className="font-medium mb-2">{product.name}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Quantidade total:</span>
                              <span>{product.totalQuantity} {product.unit.split('/')[0]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Por tanque:</span>
                              <span>{product.quantityPerTank} {product.unit.split('/')[0]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e clique em "Calcular Calda"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SprayCalculator;