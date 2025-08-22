import { Calendar, Users, Calculator, CloudSun, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroFarm from "@/assets/hero-farm.jpg";

const Dashboard = () => {
  const quickStats = [
    { title: "Leads Ativos", value: "24", change: "+12%", icon: Users, color: "text-status-success" },
    { title: "Agendamentos Hoje", value: "8", change: "+4", icon: Calendar, color: "text-primary" },
    { title: "Visitas da Semana", value: "15", change: "+20%", icon: MapPin, color: "text-secondary" },
    { title: "Taxa de Conversão", value: "68%", change: "+5%", icon: TrendingUp, color: "text-accent" },
  ];

  const quickActions = [
    { title: "Nova Agenda", description: "Agendar tarefa, serviço ou visita", icon: Calendar, href: "/agenda", color: "bg-primary" },
    { title: "Adicionar Lead", description: "Cadastrar novo lead no sistema", icon: Users, href: "/leads", color: "bg-secondary" },
    { title: "Calculadora", description: "Calcular calda de pulverização", icon: Calculator, href: "/calculadora", color: "bg-accent" },
    { title: "Previsão do Tempo", description: "Consultar condições climáticas", icon: CloudSun, href: "/previsao", color: "bg-primary" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div 
        className="relative rounded-2xl overflow-hidden bg-gradient-hero h-64 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${heroFarm})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Wincenter</h1>
          <p className="text-xl text-white/90">Seu CRM agrícola completo</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.color}`}>
                  {stat.change} desde o mês passado
                </p>
              </CardContent>
            </Card>
          );
        })}
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
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <div className="bg-status-success w-2 h-2 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Lead convertido - João Silva</p>
                <p className="text-xs text-muted-foreground">Há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <div className="bg-primary w-2 h-2 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Agendamento criado - Visita técnica</p>
                <p className="text-xs text-muted-foreground">Há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
              <div className="bg-secondary w-2 h-2 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Novo lead cadastrado - Maria Santos</p>
                <p className="text-xs text-muted-foreground">Há 6 horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;