import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, CheckCircle, ExternalLink, AlertTriangle, Clock } from "lucide-react";

const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/fnL56ge";

export default function Assinar() {
  const { profile, hasAccess, isAdmin } = useAuth();

  if (isAdmin || hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const isTrial = profile?.status_assinatura === "trial";
  const isCanceled = profile?.status_assinatura === "canceled";
  const isExpired =
    profile?.data_expiracao && new Date(profile.data_expiracao) <= new Date();

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-12 space-y-6">
        {/* Status banner */}
        {isExpired && isTrial && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Seu período de teste expirou</p>
              <p className="text-sm text-muted-foreground">
                Assine o plano Premium para continuar usando todas as funcionalidades.
              </p>
            </div>
          </div>
        )}

        {isExpired && !isTrial && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Seu acesso foi encerrado</p>
              <p className="text-sm text-muted-foreground">
                {isCanceled
                  ? "Sua assinatura foi cancelada e o período pago já terminou."
                  : "Renove sua assinatura para recuperar o acesso."}
              </p>
            </div>
          </div>
        )}

        {!isExpired && !isTrial && !isCanceled && profile?.plano === "free" && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
            <Crown className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Você está no plano gratuito. Assine o Premium para desbloquear tudo!
            </p>
          </div>
        )}

        <Card className="rounded-2xl border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Assine o Premium</CardTitle>
            <p className="text-muted-foreground mt-2">
              Desbloqueie todas as funcionalidades e maximize seus lucros como motorista.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2 text-sm text-foreground">
              {[
                "Relatórios completos (diário, semanal, mensal, anual)",
                "Controle de turno com cronômetro",
                "Cálculo automático de custos fixos",
                "Exportação de dados em CSV",
                "Suporte prioritário",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Button
              className="w-full rounded-xl text-base py-6"
              onClick={() => window.open(KIWIFY_CHECKOUT_URL, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Assinar agora via Kiwify
            </Button>

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Após a confirmação do pagamento, seu acesso será liberado automaticamente em até 1 minuto.
                Use o <strong>mesmo email</strong> da sua conta aqui no app ao realizar a compra na Kiwify.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
