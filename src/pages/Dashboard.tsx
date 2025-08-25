import { Calendar, Users, Calculator, CloudSun, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads } from "@/hooks/useLeads";
import { useAppointments } from "@/hooks/useAppointments";
import CalendarWidget from "@/components/CalendarWidget";

const Dashboard = () => {
  const { leads, loading: leadsLoading } = useLeads();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  const today = new Date().toISOString().split('T')[0];
  const thisWeek = (() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return { start: startOfWeek.toISOString().split('T')[0], end: endOfWeek.toISOString().split('T')[0] };
  })();

  // Calculate real statistics
  const activeLeads = leads.length;
  const todayAppointments = appointments.filter(apt => apt.date === today).length;
  const weekAppointments = appointments.filter(apt => 
    apt.date >= thisWeek.start && apt.date <= thisWeek.end
  ).length;
  const hotLeads = leads.filter(lead => lead.status === "quente").length;
  const conversionRate = activeLeads > 0 ? Math.round((hotLeads / activeLeads) * 100) : 0;

  const quickStats = [
    { title: "Leads Ativos", value: activeLeads.toString(), change: "", icon: Users, color: "text-status-success" },
    { title: "Agendamentos Hoje", value: todayAppointments.toString(), change: "", icon: Calendar, color: "text-primary" },
    { title: "Visitas da Semana", value: weekAppointments.toString(), change: "", icon: MapPin, color: "text-secondary" },
    { title: "Taxa de Conversão", value: `${conversionRate}%`, change: "", icon: TrendingUp, color: "text-accent" },
  ];

  const quickActions = [
    { title: "Nova Agenda", description: "Agendar tarefa, serviço ou visita", icon: Calendar, href: "/agenda", color: "bg-primary" },
    { title: "Adicionar Lead", description: "Cadastrar novo lead no sistema", icon: Users, href: "/leads", color: "bg-secondary" },
    { title: "Calculadora", description: "Calcular calda de pulverização", icon: Calculator, href: "/calculadora", color: "bg-accent" },
    { title: "Previsão do Tempo", description: "Consultar condições climáticas", icon: CloudSun, href: "/previsao", color: "bg-primary" },
  ];

  // Recent activities from real data
  const recentActivities = [
    ...leads.slice(0, 2).map(lead => ({
      type: 'lead',
      title: `Novo lead - ${lead.name}`,
      time: new Date(lead.createdAt).toLocaleString('pt-BR'),
      color: 'bg-secondary'
    })),
    ...appointments.slice(0, 2).map(apt => ({
      type: 'appointment', 
      title: `${apt.type} - ${apt.title}`,
      time: new Date(`${apt.date}T${apt.time}`).toLocaleString('pt-BR'),
      color: 'bg-primary'
    }))
  ].slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Calendar Widget */}
      <div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Wincenter</h1>
          <p className="text-xl text-muted-foreground">Seu CRM agrícola completo</p>
        </div>
        <CalendarWidget />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {leadsLoading || appointmentsLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">Dados atuais do sistema</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-all hover:scale-105">
                <CardHeader>
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={action.href}>Acessar</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas ações realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {leadsLoading || appointmentsLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                  <div className={`${activity.color} w-2 h-2 rounded-full`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma atividade recente encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">Adicione leads ou agendamentos para ver as atividades aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;