import { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Crown, Ban, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  user_id: string;
  name: string;
  email: string;
  plano: string;
  status_assinatura: string | null;
  data_expiracao: string | null;
}

export default function AdminUsers() {
  const api = useAdminApi();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [confirmAction, setConfirmAction] = useState<{ type: "activate" | "deactivate"; user: User } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listUsers(search, page);
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleActivate = async () => {
    if (!confirmAction) return;
    try {
      await api.activatePremium(confirmAction.user.user_id, 30);
      toast.success(`Premium ativado para ${confirmAction.user.email}`);
      setConfirmAction(null);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmAction) return;
    try {
      await api.deactivateUser(confirmAction.user.user_id, "Admin action");
      toast.success(`Acesso desativado para ${confirmAction.user.email}`);
      setConfirmAction(null);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusBadge = (u: User) => {
    const s = u.status_assinatura;
    if (s === "active") return <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">Ativo</Badge>;
    if (s === "trial") return <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">Trial</Badge>;
    if (s === "canceled") return <Badge variant="destructive">Cancelado</Badge>;
    return <Badge variant="secondary">Free</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{u.plano}</Badge></TableCell>
                  <TableCell>{statusBadge(u)}</TableCell>
                  <TableCell className="text-sm">
                    {u.data_expiracao ? new Date(u.data_expiracao).toLocaleDateString("pt-BR") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/users/${u.user_id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => setConfirmAction({ type: "activate", user: u })}>
                        <Crown className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmAction({ type: "deactivate", user: u })}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} usuário(s)</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" disabled={users.length < 50} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "activate" ? "Ativar Premium" : "Desativar Acesso"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "activate"
                ? `Tem certeza que deseja ativar 30 dias de Premium para ${confirmAction?.user.email}?`
                : `Tem certeza que deseja desativar o acesso de ${confirmAction?.user.email}? O acesso será revogado imediatamente.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancelar</Button>
            <Button
              variant={confirmAction?.type === "activate" ? "default" : "destructive"}
              onClick={confirmAction?.type === "activate" ? handleActivate : handleDeactivate}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
