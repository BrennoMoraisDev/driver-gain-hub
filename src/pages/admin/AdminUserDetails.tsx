import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Crown, Ban } from "lucide-react";

export default function AdminUserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const api = useAdminApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | null>(null);

  useEffect(() => {
    if (!userId) return;
    api.userDetails(userId).then(setData).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>;
  if (!data?.profile) return <div className="p-6 text-muted-foreground">Usuário não encontrado</div>;

  const p = data.profile;

  const handleAction = async () => {
    if (!userId || !confirmAction) return;
    try {
      if (confirmAction === "activate") {
        await api.activatePremium(userId, 30);
        toast.success("Premium ativado!");
      } else {
        await api.deactivateUser(userId);
        toast.success("Acesso desativado!");
      }
      setConfirmAction(null);
      const refreshed = await api.userDetails(userId);
      setData(refreshed);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/admin/users")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{p.name || "Sem nome"}</h2>
          <p className="text-sm text-muted-foreground">{p.email}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1" onClick={() => setConfirmAction("activate")}>
            <Crown className="h-4 w-4" /> Ativar Premium
          </Button>
          <Button size="sm" variant="destructive" className="gap-1" onClick={() => setConfirmAction("deactivate")}>
            <Ban className="h-4 w-4" /> Desativar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Plano</CardTitle></CardHeader><CardContent><Badge variant="outline">{p.plano}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader><CardContent><Badge>{p.status_assinatura || "—"}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiração</CardTitle></CardHeader><CardContent><p className="text-sm">{p.data_expiracao ? new Date(p.data_expiracao).toLocaleDateString("pt-BR") : "—"}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cadastro</CardTitle></CardHeader><CardContent><p className="text-sm">{new Date(p.created_at).toLocaleDateString("pt-BR")}</p></CardContent></Card>
      </div>

      {data.vehicle && (
        <Card>
          <CardHeader><CardTitle className="text-base">Veículo</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>Valor FIPE: R$ {data.vehicle.valor_fipe?.toLocaleString("pt-BR")}</p>
            <p>Financiamento: R$ {data.vehicle.financiamento_mensal?.toLocaleString("pt-BR") || "0"}/mês</p>
          </CardContent>
        </Card>
      )}

      {data.recentRecords?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Últimos Registros Diários</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>Lucro Líq.</TableHead>
                  <TableHead>Corridas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentRecords.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>R$ {(r.total_faturamento || 0).toFixed(2)}</TableCell>
                    <TableCell>R$ {(r.lucro_liquido || 0).toFixed(2)}</TableCell>
                    <TableCell>{(r.uber_rides || 0) + (r.ninety_nine_rides || 0) + (r.indrive_rides || 0) + (r.private_rides || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction === "activate" ? "Ativar Premium" : "Desativar Acesso"}</DialogTitle>
            <DialogDescription>
              {confirmAction === "activate"
                ? `Ativar 30 dias de Premium para ${p.email}?`
                : `Desativar acesso de ${p.email} imediatamente?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancelar</Button>
            <Button variant={confirmAction === "activate" ? "default" : "destructive"} onClick={handleAction}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
