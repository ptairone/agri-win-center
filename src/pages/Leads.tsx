import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, Edit, Trash2, Users, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLeads, type Lead } from "@/hooks/useLeads";

const Leads = () => {
  const { leads, loading, saveLead, deleteLead } = useLeads();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    farm: "",
    city: "",
    state: "",
    status: "frio" as Lead["status"],
    hectares: 0,
    mainCrop: "",
    otherCrops: "",
    notes: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      farm: "",
      city: "",
      state: "",
      status: "frio",
      hectares: 0,
      mainCrop: "",
      otherCrops: "",
      notes: ""
    });
    setEditingLead(null);
  };

  const openDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        farm: lead.farm,
        city: lead.city,
        state: lead.state,
        status: lead.status,
        hectares: lead.hectares,
        mainCrop: lead.mainCrop,
        otherCrops: lead.otherCrops,
        notes: lead.notes
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveLead = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios (nome, telefone e email)",
        variant: "destructive"
      });
      return;
    }

    const leadData = {
      id: editingLead?.id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      farm: formData.farm,
      city: formData.city,
      state: formData.state,
      status: formData.status,
      hectares: formData.hectares,
      mainCrop: formData.mainCrop,
      otherCrops: formData.otherCrops,
      notes: formData.notes
    };

    const success = await saveLead(leadData);
    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleDeleteLead = async (id: string) => {
    await deleteLead(id);
  };

  const getStatusBadge = (status: Lead["status"]) => {
    const statusConfig = {
      frio: { label: "Frio", variant: "secondary" as const, className: "text-status-cold" },
      morno: { label: "Morno", variant: "secondary" as const, className: "text-status-warm" },
      quente: { label: "Quente", variant: "secondary" as const, className: "text-status-hot" }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.farm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Leads</h1>
          <p className="text-muted-foreground">Cadastre e acompanhe seus prospects agrícolas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
              <DialogDescription>
                Preencha as informações do lead para cadastro no CRM
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Informações de Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nome do lead"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farm">Fazenda</Label>
                    <Input
                      id="farm"
                      value={formData.farm}
                      onChange={(e) => setFormData({...formData, farm: e.target.value})}
                      placeholder="Nome da fazenda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Status e Informações Agrícolas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Agrícolas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status do Lead</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Lead["status"]})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frio">Frio</SelectItem>
                        <SelectItem value="morno">Morno</SelectItem>
                        <SelectItem value="quente">Quente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hectares">Hectares</Label>
                    <Input
                      id="hectares"
                      type="number"
                      value={formData.hectares || ""}
                      onChange={(e) => setFormData({...formData, hectares: Number(e.target.value)})}
                      placeholder="Área em hectares"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mainCrop">Cultura Principal</Label>
                    <Input
                      id="mainCrop"
                      value={formData.mainCrop}
                      onChange={(e) => setFormData({...formData, mainCrop: e.target.value})}
                      placeholder="Ex: Soja, Milho, Cana"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherCrops">Outras Culturas</Label>
                    <Input
                      id="otherCrops"
                      value={formData.otherCrops}
                      onChange={(e) => setFormData({...formData, otherCrops: e.target.value})}
                      placeholder="Culturas secundárias"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Anotações sobre o lead, histórico de contatos, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveLead}>
                  {editingLead ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-status-hot flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === "quente").length}</p>
                <p className="text-sm text-muted-foreground">Leads Quentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-status-warm flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === "morno").length}</p>
                <p className="text-sm text-muted-foreground">Leads Mornos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-status-cold flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === "frio").length}</p>
                <p className="text-sm text-muted-foreground">Leads Frios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou fazenda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="frio">Frio</SelectItem>
                  <SelectItem value="morno">Morno</SelectItem>
                  <SelectItem value="quente">Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>
            {filteredLeads.length} lead(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cultura</TableHead>
                  <TableHead>Hectares</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.farm}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-sm">{lead.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{lead.city}, {lead.state}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>{lead.mainCrop}</TableCell>
                    <TableCell>{lead.hectares} ha</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(lead)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info card about Supabase */}
      <Card className="shadow-soft border-dashed">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">💡 Funcionalidade Completa</h3>
            <p className="text-sm text-muted-foreground">
              Para persistir os dados dos leads e habilitar funcionalidades completas de CRM, 
              conecte ao Supabase usando o botão verde no topo da interface.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;