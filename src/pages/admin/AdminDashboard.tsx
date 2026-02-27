import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Users, Crown, Clock, Zap, Activity, AlertTriangle } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  freeUsers: number;
  totalEvents: number;
  eventsToday: number;
}

export default function AdminDashboard() {
  const api = useAdminApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>;

  const cards = [
    { label: "Total de Usuários", value: stats?.totalUsers ?? 0, icon: Users, color: "text-primary" },
    { label: "Premium Ativos", value: stats?.activeUsers ?? 0, icon: Crown, color: "text-emerald-500" },
    { label: "Em Trial", value: stats?.trialUsers ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Plano Free", value: stats?.freeUsers ?? 0, icon: AlertTriangle, color: "text-destructive" },
    { label: "Total Eventos Kiwify", value: stats?.totalEvents ?? 0, icon: Activity, color: "text-primary" },
    { label: "Eventos Hoje", value: stats?.eventsToday ?? 0, icon: Zap, color: "text-emerald-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            <c.icon className={`h-5 w-5 ${c.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
