import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Gauge,
  MapPin,
  Clock,
  Calendar as CalendarIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  condition: string;
  icon: string;
  datetime: string;
  rainProbability?: number;
  rainAmount?: number;
}

interface ForecastHour {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  rainProbability: number;
  rainAmount: number;
}

const WeatherForecast = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("12:00");
  const [hourlyForecast, setHourlyForecast] = useState<ForecastHour[]>([]);
  const { toast } = useToast();

  const API_KEY = "2266f269be41b5b6234971e5e0a7e46d";

  const searchWeather = async () => {
    if (!city.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome de uma cidade",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedDate) {
        // Com data selecionada: usa previsão
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`
        );

        if (!response.ok) {
          throw new Error("Cidade não encontrada");
        }

        const data = await response.json();

        // Combina data e hora selecionadas
        const [h, m] = (selectedTime || "12:00").split(":").map(Number);
        const target = new Date(selectedDate);
        target.setHours(h || 12, m || 0, 0, 0);
        const targetMs = target.getTime();

        // Encontra previsão mais próxima
        const nearest = (data.list || []).reduce((prev: any, curr: any) => {
          const prevDiff = Math.abs((prev?.dt || 0) * 1000 - targetMs);
          const currDiff = Math.abs((curr?.dt || 0) * 1000 - targetMs);
          return currDiff < prevDiff ? curr : prev;
        }, (data.list || [])[0]);

        if (!nearest) throw new Error("Não há previsão disponível para essa data/hora");

        const weatherData: WeatherData = {
          location: `${data.city?.name}, ${data.city?.country}`,
          temperature: Math.round(nearest.main?.temp),
          feelsLike: Math.round(nearest.main?.feels_like),
          humidity: nearest.main?.humidity,
          windSpeed: Math.round((nearest.wind?.speed || 0) * 3.6),
          windDirection: nearest.wind?.deg ?? 0,
          pressure: nearest.main?.pressure,
          visibility: nearest.visibility ? Math.round(nearest.visibility / 1000) : 0,
          condition: nearest.weather?.[0]?.description || "",
          icon: nearest.weather?.[0]?.icon || "01d",
          datetime: new Date(nearest.dt * 1000).toLocaleString('pt-BR'),
          rainProbability: Math.round((nearest.pop || 0) * 100),
          rainAmount: nearest.rain?.['3h'] || 0
        };

        // Próximas 3 previsões (9 horas)
        const next3Hours = (data.list || []).slice(0, 3).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          temperature: Math.round(item.main?.temp),
          condition: item.weather?.[0]?.description || "",
          icon: item.weather?.[0]?.icon || "01d",
          rainProbability: Math.round((item.pop || 0) * 100),
          rainAmount: item.rain?.['3h'] || 0
        }));

        setHourlyForecast(next3Hours);
        setWeather(weatherData);
        toast({
          title: "Sucesso",
          description: `Previsão obtida para ${weatherData.location} em ${weatherData.datetime}`,
        });
      } else {
        // Sem data: clima atual + previsão próximas horas
        const [currentResponse, forecastResponse] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
          throw new Error("Cidade não encontrada");
        }

        const [currentData, forecastData] = await Promise.all([
          currentResponse.json(),
          forecastResponse.json()
        ]);

        const weatherData: WeatherData = {
          location: `${currentData.name}, ${currentData.sys.country}`,
          temperature: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          windDirection: currentData.wind.deg,
          pressure: currentData.main.pressure,
          visibility: Math.round(currentData.visibility / 1000),
          condition: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          datetime: new Date().toLocaleString('pt-BR')
        };

        // Próximas 3 previsões (9 horas)
        const next3Hours = (forecastData.list || []).slice(0, 3).map((item: any) => ({
          time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          temperature: Math.round(item.main?.temp),
          condition: item.weather?.[0]?.description || "",
          icon: item.weather?.[0]?.icon || "01d",
          rainProbability: Math.round((item.pop || 0) * 100),
          rainAmount: item.rain?.['3h'] || 0
        }));

        setHourlyForecast(next3Hours);
        setWeather(weatherData);
        toast({
          title: "Sucesso",
          description: `Dados meteorológicos obtidos para ${weatherData.location}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível obter os dados meteorológicos. Verifique o nome da cidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Previsão do Tempo</h1>
        <p className="text-muted-foreground">Consulte condições meteorológicas para planejamento agrícola</p>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudSun className="h-5 w-5" />
            <span>Buscar Cidade</span>
          </CardTitle>
          <CardDescription>Digite o nome da cidade para consultar o clima</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="city" className="sr-only">Cidade</Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo, Curitiba, Ribeirão Preto..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-11"
              />
            </div>
            <Button 
              onClick={searchWeather} 
              disabled={loading}
              size="lg"
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Horário (opcional)</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          
          {selectedDate && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              <Clock className="inline h-4 w-4 mr-2" />
              Previsão para: {format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hourly Forecast */}
      {hourlyForecast.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span>Próximas 9 Horas - Probabilidade de Chuva</span>
            </CardTitle>
            <CardDescription>Previsão detalhada por período de 3 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hourlyForecast.map((forecast, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{forecast.time}</span>
                    <img 
                      src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
                      alt={forecast.condition}
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Temp:</span>
                      <span className="font-medium">{forecast.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Chuva:</span>
                      <span className={`font-medium ${forecast.rainProbability > 60 ? 'text-blue-600' : forecast.rainProbability > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {forecast.rainProbability}%
                      </span>
                    </div>
                    {forecast.rainAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Volume:</span>
                        <span className="font-medium text-blue-600">{forecast.rainAmount}mm</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground capitalize">{forecast.condition}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Results */}
      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Weather Card */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>{weather.location}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>{weather.datetime}</span>
                  </CardDescription>
                </div>
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.condition}
                  className="w-16 h-16"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{weather.temperature}°C</div>
                  <p className="text-muted-foreground capitalize">{weather.condition}</p>
                  <p className="text-sm text-muted-foreground">Sensação: {weather.feelsLike}°C</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{weather.humidity}%</p>
                      <p className="text-sm text-muted-foreground">Umidade</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wind className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{weather.windSpeed} km/h {getWindDirection(weather.windDirection)}</p>
                      <p className="text-sm text-muted-foreground">Vento</p>
                    </div>
                  </div>
                  {weather.rainProbability !== undefined && (
                    <div className="flex items-center space-x-3">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{weather.rainProbability}%</p>
                        <p className="text-sm text-muted-foreground">Chuva</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Pressão</p>
                    <p className="text-xs text-muted-foreground">Atmosférica</p>
                  </div>
                </div>
                <span className="font-semibold">{weather.pressure} hPa</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Visibilidade</p>
                    <p className="text-xs text-muted-foreground">Alcance visual</p>
                  </div>
                </div>
                <span className="font-semibold">{weather.visibility} km</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Thermometer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Sensação</p>
                    <p className="text-xs text-muted-foreground">Térmica</p>
                  </div>
                </div>
                <span className="font-semibold">{weather.feelsLike}°C</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agricultural Tips */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Dicas Agrícolas</CardTitle>
          <CardDescription>Recomendações baseadas nas condições climáticas</CardDescription>
        </CardHeader>
        <CardContent>
          {weather ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weather.windSpeed > 15 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Vento Forte</h4>
                  <p className="text-sm text-yellow-700">
                    Vento acima de 15 km/h. Evite pulverizações para reduzir deriva.
                  </p>
                </div>
              )}
              
              {weather.humidity < 40 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">🌡️ Baixa Umidade</h4>
                  <p className="text-sm text-orange-700">
                    Umidade baixa pode causar evaporação rápida. Ajuste a aplicação.
                  </p>
                </div>
              )}
              
              {weather.temperature > 30 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">🌡️ Temperatura Alta</h4>
                  <p className="text-sm text-red-700">
                    Temperaturas elevadas. Prefira aplicações no início da manhã ou final da tarde.
                  </p>
                </div>
              )}
              
              {weather.windSpeed <= 15 && weather.humidity >= 40 && weather.temperature <= 30 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Condições Ideais</h4>
                  <p className="text-sm text-green-700">
                    Condições favoráveis para aplicações agrícolas.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Busque uma cidade para ver as recomendações específicas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherForecast;