import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, CheckCircle, AlertTriangle, Play, DollarSign, TrendingUp, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

function SubscriptionBanner({ profile, isReadOnly }: { profile: any; isReadOnly: boolean }) {
  if (!profile) return null;
  const isAdmin = profile.email === "brennomoraisdev@gmail.com";
  if (isAdmin) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3">
        <Star className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm font-semibold text-foreground">Admin – Acesso vitalício</p>
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Assinatura expirada</p>
          <p className="text-xs text-muted-foreground">Seus dados estão em modo leitura. Assine para continuar registrando.</p>
        </div>
      </div>
    );
  }

  const status = profile.status_assinatura;
  const expDate = profile.data_expiracao ? new Date(profile.data_expiracao) : null;
  const now = new Date();
  if (status === "trial" && expDate && expDate > now) {
    const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10 px-5 py-3">
        <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
        <p className="text-sm font-semibold text-foreground">Teste grátis – {daysLeft} dia{daysLeft !== 1 ? "s" : ""} restante{daysLeft !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  if (status === "active" && expDate && expDate > now) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3">
        <CheckCircle className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm font-semibold text-foreground">Premium ativo</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-3">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
      <p className="text-sm font-semibold text-foreground">Assinatura expirada</p>
    </div>
  );
}

interface TodaySummary {
  total_faturamento: number | null;
  lucro_liquido: number | null;
  tempo_ativo_segundos: number | null;
  uber_rides: number | null;
  ninety_nine_rides: number | null;
  indrive_rides: number | null;
  private_rides: number | null;
}

export default function Dashboard() {
  const { user, profile, isReadOnly } = useAuth();
  const navigate = useNavigate();
  const [activeShift, setActiveShift] = useState<{ id: string } | null>(null);
  const [todayRecord, setTodayRecord] = useState<TodaySummary | null>(null);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      supabase
        .from("shift_sessions")
        .select("id")
        .eq("user_id", user.id)
        .is("end_time", null)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("daily_records")
        .select("total_faturamento, lucro_liquido, tempo_ativo_segundos, uber_rides, ninety_nine_rides, indrive_rides, private_rides")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle(),
    ]).then(([shiftRes, recordRes]) => {
      if (shiftRes.data) setActiveShift(shiftRes.data);
      if (recordRes.data) setTodayRecord(recordRes.data as TodaySummary);
    });
  }, [user]);

  const totalCorridas = todayRecord
    ? (todayRecord.uber_rides ?? 0) + (todayRecord.ninety_nine_rides ?? 0) + (todayRecord.indrive_rides ?? 0) + (todayRecord.private_rides ?? 0)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-8 space-y-5">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {profile?.name?.split(" ")[0] || "Motorista"}! 👋
          </h1>
        </div>

        {/* Subscription status */}
        <SubscriptionBanner profile={profile} isReadOnly={isReadOnly} />

        {/* CTA to subscribe when read-only */}
        {isReadOnly && (
          <Button className="w-full rounded-xl" onClick={() => navigate("/assinar")}>
            Assinar agora
          </Button>
        )}

        {/* Shift CTA - hidden when read-only */}
        {!isReadOnly && (
          <Card
            className="rounded-2xl border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/turno")}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Play className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">
                  {activeShift ? "Continuar Turno" : "Iniciar Turno"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeShift ? "Você tem um turno ativo" : "Comece a cronometrar seu dia"}
                </p>
              </div>
              <Button size="sm" className="rounded-xl">Ir</Button>
            </CardContent>
          </Card>
        )}

        {/* Today summary */}
        {todayRecord && (
          <Card className="rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Resumo de hoje</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                  <p className="text-sm font-bold text-foreground">{fmt(todayRecord.total_faturamento ?? 0)}</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Lucro</p>
                  <p className={`text-sm font-bold ${(todayRecord.lucro_liquido ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                    {fmt(todayRecord.lucro_liquido ?? 0)}
                  </p>
                </div>
                <div className="text-center">
                  <Timer className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Tempo</p>
                  <p className="text-sm font-bold text-foreground">{formatTime(todayRecord.tempo_ativo_segundos ?? 0)}</p>
                </div>
              </div>
              {totalCorridas > 0 && (
                <p className="text-xs text-center text-muted-foreground">{totalCorridas} corrida{totalCorridas !== 1 ? "s" : ""} hoje</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick actions - hidden when read-only */}
        {!isReadOnly && (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl h-12" onClick={() => navigate("/finalizar-dia")}>
              Finalizar Dia
            </Button>
            <Button variant="outline" className="rounded-xl h-12" onClick={() => navigate("/relatorios")}>
              Relatórios
            </Button>
          </div>
        )}

        {/* Read-only: only show reports link */}
        {isReadOnly && (
          <Button variant="outline" className="w-full rounded-xl h-12" onClick={() => navigate("/relatorios")}>
            Ver Relatórios
          </Button>
        )}
      </div>
    </Layout>
  );
}
