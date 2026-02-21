import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDirectionsCar, MdAttachMoney, MdTrendingUp } from "react-icons/md";
import { Star, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Layout from "@/components/Layout";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function SubscriptionBanner({ profile }: { profile: any }) {
  if (!profile) return null;

  const isAdmin = profile.email === "brennomoraisdev@gmail.com";

  if (isAdmin) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
        <Star className="h-6 w-6 text-primary" />
        <div>
          <p className="font-semibold text-foreground">Admin – Acesso vitalício</p>
          <p className="text-sm text-muted-foreground">Você tem acesso completo à plataforma.</p>
        </div>
      </div>
    );
  }

  const status = profile.status_assinatura;
  const expDate = profile.data_expiracao ? new Date(profile.data_expiracao) : null;
  const now = new Date();
  const isExpired = expDate && expDate < now;

  if (status === "trial" && !isExpired && expDate) {
    const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-50 px-5 py-4 dark:bg-yellow-900/10">
        <Clock className="h-6 w-6 text-yellow-600" />
        <div>
          <p className="font-semibold text-foreground">Teste grátis – {daysLeft} dia{daysLeft !== 1 ? "s" : ""} restante{daysLeft !== 1 ? "s" : ""}</p>
          <p className="text-sm text-muted-foreground">Aproveite todas as funcionalidades premium.</p>
        </div>
      </div>
    );
  }

  if (status === "active" && !isExpired) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 px-5 py-4">
        <CheckCircle className="h-6 w-6 text-secondary" />
        <div>
          <p className="font-semibold text-foreground">Premium ativo</p>
          <p className="text-sm text-muted-foreground">Sua assinatura está ativa.</p>
        </div>
      </div>
    );
  }

  // Expired
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
      <AlertTriangle className="h-6 w-6 text-destructive" />
      <div>
        <p className="font-semibold text-foreground">Assinatura expirada</p>
        <p className="text-sm text-muted-foreground">Assine novamente para continuar usando.</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {profile?.name || "Motorista"}! 🥳
          </h1>
          <p className="mt-2 text-muted-foreground">
            Aqui está seu painel de controle.
          </p>
        </div>

        <SubscriptionBanner profile={profile} />

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Corridas Hoje</CardTitle>
              <MdDirectionsCar className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Comece a registrar suas corridas</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ganhos Hoje</CardTitle>
              <MdAttachMoney className="h-6 w-6 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">R$ 0,00</div>
              <p className="text-xs text-muted-foreground mt-1">Acompanhe seus ganhos diários</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
              <MdTrendingUp className="h-6 w-6" style={{ color: "hsl(160, 72%, 37%)" }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "hsl(160, 72%, 37%)" }}>R$ 0,00</div>
              <p className="text-xs text-muted-foreground mt-1">Descontando combustível e despesas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
