import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MapPin } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { format, isSameDay } from "date-fns";

const CalendarWidget = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { appointments } = useAppointments();

  // Get appointments for the selected date
  const selectedDateAppointments = selectedDate 
    ? appointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return isSameDay(aptDate, selectedDate);
      })
    : [];

  // Get all dates that have appointments for highlighting
  const appointmentDates = appointments.map(apt => new Date(apt.date + 'T00:00:00'));

  const appointmentTypes = {
    tarefa: { label: "Tarefa", color: "bg-blue-500" },
    servico: { label: "Serviço", color: "bg-green-500" },
    visita: { label: "Visita", color: "bg-orange-500" },
    suporte: { label: "Suporte", color: "bg-purple-500" }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      andamento: { label: "Em Andamento", variant: "default" as const },
      concluida: { label: "Concluída", variant: "outline" as const }
    };
    return <Badge variant={statusConfig[status as keyof typeof statusConfig]?.variant || "secondary"}>
      {statusConfig[status as keyof typeof statusConfig]?.label || status}
    </Badge>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Calendário da Agenda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full pointer-events-auto"
            modifiers={{
              hasAppointment: appointmentDates
            }}
            modifiersStyles={{
              hasAppointment: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Appointments */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Agendamentos para ${format(selectedDate, "dd/MM/yyyy")}`
              : "Selecione uma data"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length > 0 ? (
            <div className="space-y-4">
              {selectedDateAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <div className={`${appointmentTypes[appointment.type as keyof typeof appointmentTypes]?.color || 'bg-gray-500'} w-8 h-8 rounded-full flex items-center justify-center`}>
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{appointment.title}</h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.time}</span>
                        {appointment.end_time && <span>- {appointment.end_time}</span>}
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{appointment.responsible}</span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>
                    {appointment.description && (
                      <p className="text-xs text-muted-foreground mt-2">{appointment.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para esta data</p>
              <p className="text-xs mt-1">Os dias com agendamentos aparecem destacados no calendário</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarWidget;