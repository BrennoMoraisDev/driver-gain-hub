import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Target, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

export default function Metas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metaMensal, setMetaMensal] = useState("");
  const [diasTrabalho, setDiasTrabalho] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setSettingsId(data.id);
        setMetaMensal(String(data.meta_mensal || ""));
        setDiasTrabalho(String(data.dias_trabalho_mes || ""));
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        meta_mensal: parseFloat(metaMensal) || 0,
        dias_trabalho_mes: parseInt(diasTrabalho) || 22,
      };

      if (settingsId) {
        const { error } = await supabase
          .from("user_settings")
          .update(payload)
          .eq("id", settingsId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("user_settings")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        if (data) setSettingsId(data.id);
      }
      toast({ title: "Metas salvas!", description: "Suas metas foram atualizadas com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const metaDiaria = metaMensal && diasTrabalho
    ? (parseFloat(metaMensal) / (parseInt(diasTrabalho) || 1)).toFixed(2)
    : "0.00";

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-10">
        <Card className="rounded-2xl border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-primary" />
              Metas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="metaMensal">Meta de faturamento mensal (R$)</Label>
                <Input
                  id="metaMensal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={metaMensal}
                  onChange={(e) => setMetaMensal(e.target.value)}
                  placeholder="Ex: 6000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasTrabalho">Dias de trabalho no mês</Label>
                <Input
                  id="diasTrabalho"
                  type="number"
                  min="1"
                  max="31"
                  value={diasTrabalho}
                  onChange={(e) => setDiasTrabalho(e.target.value)}
                  placeholder="Ex: 22"
                  className="rounded-xl"
                />
              </div>

              <div className="rounded-xl bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">Meta diária estimada</p>
                <p className="text-2xl font-bold text-primary">R$ {metaDiaria}</p>
              </div>

              <Button type="submit" className="w-full rounded-xl" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="h-4 w-4" />Salvar metas</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
