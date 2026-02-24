import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, CheckCircle, ExternalLink } from "lucide-react";

const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/fnL56ge";

export default function Assinar() {
  const { profile } = useAuth();

  const isActive =
    profile?.status_assinatura === "active" &&
    profile?.data_expiracao &&
    new Date(profile.data_expiracao) > new Date();

  const isAdmin = profile?.email === "brennomoraisdev@gmail.com";

  if (isAdmin || isActive) {
    return (
      <Layout>
        <div className="container mx-auto max-w-lg px-4 py-16 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Você já tem acesso Premium!</h1>
          <p className="text-muted-foreground">Aproveite todas as funcionalidades da plataforma.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-12">
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

            <p className="text-xs text-center text-muted-foreground">
              Após a compra, sua conta será ativada automaticamente em alguns minutos.
              Se não ativar, entre em contato conosco.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
