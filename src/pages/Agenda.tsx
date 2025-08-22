import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Clock, User, MapPin, Wrench, ShoppingCart, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppointments, type Appointment } from "@/hooks/useAppointments";

const Agenda = () => {
  const { appointments, loading, saveAppointment, deleteAppointment } = useAppointments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedType, setSelectedType] = useState<Appointment["type"]>("tarefa");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    responsible: "",
    client: "",
    location: "",
    status: "pendente" as Appointment["status"]
  });

  const appointmentTypes = {
    tarefa: {
      label: "Tarefa",
      icon: Clock,
      color: "bg-blue-500",
      description: "Tarefas internas e administrativas"
    },
    servico: {
      label: "Serviço",
      icon: Wrench,
      color: "bg-green-500",
      description: "Serviços técnicos e manutenção"
    },
    visita: {
      label: "Visita",
      icon: ShoppingCart,
      color: "bg-orange-500",
      description: "Visitas comerciais e vendas"
    },
    suporte: {
      label: "Suporte",
      icon: PhoneCall,
      color: "bg-purple-500",
      description: "Atendimento e suporte ao cliente"
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      endTime: "",
      responsible: "",
      client: "",
      location: "",
      status: "pendente"
    });
    setEditingAppointment(null);
  };

  const openDialog = (type?: Appointment["type"], appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setSelectedType(appointment.type);
      setFormData({
        title: appointment.title,
        description: appointment.description,
        date: appointment.date,
        time: appointment.time,
        endTime: appointment.end_time || "",
        responsible: appointment.responsible,
        client: appointment.client || "",
        location: appointment.location || "",
        status: appointment.status
      });
    } else {
      resetForm();
      if (type) setSelectedType(type);
    }
    setIsDialogOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.responsible) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const appointmentData = {
      id: editingAppointment?.id,
      type: selectedType,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      end_time: formData.endTime,
      responsible: formData.responsible,
      client: formData.client,
      location: formData.location,
      status: formData.status
    };

    const success = await saveAppointment(appointmentData);
    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      andamento: { label: "Em Andamento", variant: "default" as const },
      concluida: { label: "Concluída", variant: "outline" as const }
    };
    return <Badge variant={statusConfig[status].variant}>{statusConfig[status].label}</Badge>;
  };

  const getTypeIcon = (type: Appointment["type"]) => {
    const Icon = appointmentTypes[type].icon;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  const upcomingAppointments = appointments.filter(apt => apt.date > new Date().toISOString().split('T')[0]).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Gerencie tarefas, serviços, visitas e suporte</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(appointmentTypes).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <Card key={type} className="shadow-soft hover:shadow-medium transition-all hover:scale-105 cursor-pointer" onClick={() => openDialog(type as Appointment["type"])}>
              <CardHeader>
                <div className={`${config.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">Novo {config.label}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Agenda de Hoje</span>
            </CardTitle>
            <CardDescription>{todayAppointments.length} agendamento(s) para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                    <div className={`${appointmentTypes[appointment.type].color} w-8 h-8 rounded-full flex items-center justify-center`}>
                      {getTypeIcon(appointment.type)}
                      <span className="text-white text-xs">
                        {/* {getTypeIcon(appointment.type)} */}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{appointment.title}</p>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      <p className="text-sm text-muted-foreground">{appointment.responsible}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>Agenda dos próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`${appointmentTypes[appointment.type].color} w-8 h-8 rounded-full flex items-center justify-center`}>
                      {getTypeIcon(appointment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{appointment.title}</p>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(appointment.date)} às {appointment.time}
                      </p>
                      <p className="text-sm text-muted-foreground">{appointment.responsible}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento futuro</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Appointments */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todos os Agendamentos</CardTitle>
              <CardDescription>{appointments.length} agendamento(s) total</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do agendamento
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Tipo de Agendamento</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(appointmentTypes).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                          <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            onClick={() => setSelectedType(type as Appointment["type"])}
                            className="justify-start"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {config.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Título do agendamento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsible">Responsável *</Label>
                      <Input
                        id="responsible"
                        value={formData.responsible}
                        onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Horário *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  {(selectedType === "servico" || selectedType === "tarefa") && (
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Horário de Término</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      />
                    </div>
                  )}

                  {(selectedType === "visita" || selectedType === "servico" || selectedType === "suporte") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client">Cliente</Label>
                        <Input
                          id="client"
                          value={formData.client}
                          onChange={(e) => setFormData({...formData, client: e.target.value})}
                          placeholder="Nome do cliente"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Endereço ou localização"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Appointment["status"]})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição detalhada do agendamento"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveAppointment}>
                      {editingAppointment ? "Atualizar" : "Agendar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`${appointmentTypes[appointment.type].color} w-10 h-10 rounded-full flex items-center justify-center`}>
                  {getTypeIcon(appointment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{appointment.title}</h3>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{appointment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{appointment.time}{appointment.end_time && ` - ${appointment.end_time}`}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{appointment.responsible}</span>
                    </div>
                    {appointment.client && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{appointment.client}</span>
                      </div>
                    )}
                    {appointment.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDialog(undefined, appointment)}
                >
                  Editar
                </Button>
              </div>
            ))}
          </div>

          {appointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum agendamento cadastrado</p>
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
              Para persistir os dados dos agendamentos e habilitar notificações automáticas, 
              conecte ao Supabase usando o botão verde no topo da interface.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;