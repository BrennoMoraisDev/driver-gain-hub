import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Car, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

export default function Veiculo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const [valorFipe, setValorFipe] = useState("");
  const [ipvaVencimento, setIpvaVencimento] = useState("");
  const [manutencao, setManutencao] = useState("");
  const [seguro, setSeguro] = useState("");
  const [financiamento, setFinanciamento] = useState("");
  const [incluirIpva, setIncluirIpva] = useState(true);
  const [incluirManutencao, setIncluirManutencao] = useState(true);
  const [incluirSeguro, setIncluirSeguro] = useState(true);
  const [incluirFinanciamento, setIncluirFinanciamento] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setVehicleId(data.id);
        setValorFipe(String(data.valor_fipe || ""));
        setIpvaVencimento(data.ipva_vencimento || "");
        setManutencao(String(data.manutencao_mensal_est ?? ""));
        setSeguro(String(data.seguro_mensal_est ?? ""));
        setFinanciamento(String(data.financiamento_mensal ?? ""));
        setIncluirIpva(data.incluir_ipva);
        setIncluirManutencao(data.incluir_manutencao);
        setIncluirSeguro(data.incluir_seguro);
        setIncluirFinanciamento(data.incluir_financiamento);
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
        valor_fipe: parseFloat(valorFipe) || 0,
        ipva_vencimento: ipvaVencimento || null,
        manutencao_mensal_est: manutencao ? parseFloat(manutencao) : null,
        seguro_mensal_est: seguro ? parseFloat(seguro) : null,
        financiamento_mensal: financiamento ? parseFloat(financiamento) : null,
        incluir_ipva: incluirIpva,
        incluir_manutencao: incluirManutencao,
        incluir_seguro: incluirSeguro,
        incluir_financiamento: incluirFinanciamento,
      };

      if (vehicleId) {
        const { error } = await supabase.from("vehicles").update(payload).eq("id", vehicleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("vehicles").insert(payload).select().single();
        if (error) throw error;
        if (data) setVehicleId(data.id);
      }
      toast({ title: "Veículo salvo!", description: "Os dados do seu veículo foram atualizados." });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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
              <Car className="h-5 w-5 text-primary" />
              Meu Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="valorFipe">Valor FIPE (R$)</Label>
                <Input id="valorFipe" type="number" min="0" step="0.01" value={valorFipe} onChange={(e) => setValorFipe(e.target.value)} placeholder="Ex: 45000" className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipvaVencimento">Vencimento do IPVA</Label>
                <Input id="ipvaVencimento" type="date" value={ipvaVencimento} onChange={(e) => setIpvaVencimento(e.target.value)} className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manutencao">Manutenção mensal estimada (R$)</Label>
                <Input id="manutencao" type="number" min="0" step="0.01" value={manutencao} onChange={(e) => setManutencao(e.target.value)} placeholder="Ex: 300" className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seguro">Seguro mensal estimado (R$)</Label>
                <Input id="seguro" type="number" min="0" step="0.01" value={seguro} onChange={(e) => setSeguro(e.target.value)} placeholder="Ex: 200" className="rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="financiamento">Financiamento mensal (R$)</Label>
                <Input id="financiamento" type="number" min="0" step="0.01" value={financiamento} onChange={(e) => setFinanciamento(e.target.value)} placeholder="Ex: 1200" className="rounded-xl" />
              </div>

              <div className="space-y-3 rounded-xl bg-muted p-4">
                <p className="text-sm font-medium text-foreground">Incluir nos cálculos:</p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sw-ipva" className="text-sm">IPVA</Label>
                  <Switch id="sw-ipva" checked={incluirIpva} onCheckedChange={setIncluirIpva} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sw-manut" className="text-sm">Manutenção</Label>
                  <Switch id="sw-manut" checked={incluirManutencao} onCheckedChange={setIncluirManutencao} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sw-seguro" className="text-sm">Seguro</Label>
                  <Switch id="sw-seguro" checked={incluirSeguro} onCheckedChange={setIncluirSeguro} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sw-fin" className="text-sm">Financiamento</Label>
                  <Switch id="sw-fin" checked={incluirFinanciamento} onCheckedChange={setIncluirFinanciamento} />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="h-4 w-4" />Salvar veículo</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
