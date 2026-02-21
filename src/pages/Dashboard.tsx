import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDirectionsCar, MdAttachMoney, MdTrendingUp } from "react-icons/md";
import Layout from "@/components/Layout";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}, {profile?.name || "Motorista"}! 🥳
          </h1>
          <p className="mt-2 text-muted-foreground">
            Aqui está seu painel de controle.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Corridas Hoje */}
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

          {/* Ganhos Hoje */}
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

          {/* Lucro Líquido */}
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
