import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Car, Fuel, UtensilsCrossed, ReceiptText } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface VehicleData {
  valor_fipe: number;
  manutencao_mensal_est: number | null;
  seguro_mensal_est: number | null;
  financiamento_mensal: number | null;
  incluir_ipva: boolean;
  incluir_manutencao: boolean;
  incluir_seguro: boolean;
  incluir_financiamento: boolean;
}

export default function FinalizarDia() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shiftId = searchParams.get("shift");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempoAtivo, setTempoAtivo] = useState(0);
  const [diasTrabalho, setDiasTrabalho] = useState(22);
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);

  // Platform fields
  const [uberRides, setUberRides] = useState(0);
  const [uberAmount, setUberAmount] = useState(0);
  const [nnRides, setNnRides] = useState(0);
  const [nnAmount, setNnAmount] = useState(0);
  const [indriveRides, setIndriveRides] = useState(0);
  const [indriveAmount, setIndriveAmount] = useState(0);
  const [privateRides, setPrivateRides] = useState(0);
  const [privateAmount, setPrivateAmount] = useState(0);

  const [kmTotal, setKmTotal] = useState(0);
  const [gastoCombustivel, setGastoCombustivel] = useState(0);
  const [gastoAlimentacao, setGastoAlimentacao] = useState(0);
  const [gastoOutros, setGastoOutros] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [vehicleRes, settingsRes] = await Promise.all([
        supabase.from("vehicles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (vehicleRes.data) setVehicle(vehicleRes.data as VehicleData);
      if (settingsRes.data) setDiasTrabalho(settingsRes.data.dias_trabalho_mes || 22);

      if (shiftId) {
        const { data } = await supabase.from("shift_sessions").select("total_active_seconds").eq("id", shiftId).single();
        if (data) setTempoAtivo(data.total_active_seconds || 0);
      }
      setLoading(false);
    })();
  }, [user, shiftId]);

  // Calculations
  const totalFaturamento = uberAmount + nnAmount + indriveAmount + privateAmount;
  const totalGastosVariaveis = gastoCombustivel + gastoAlimentacao + gastoOutros;
  const lucroBruto = totalFaturamento - totalGastosVariaveis;

  const ipvaDiaria = vehicle?.incluir_ipva ? (vehicle.valor_fipe * 0.04) / 12 / diasTrabalho : 0;
  const manutDiaria = vehicle?.incluir_manutencao ? (vehicle.manutencao_mensal_est || 0) / diasTrabalho : 0;
  const seguroDiario = vehicle?.incluir_seguro ? (vehicle.seguro_mensal_est || 0) / diasTrabalho : 0;
  const financDiario = vehicle?.incluir_financiamento ? (vehicle.financiamento_mensal || 0) / diasTrabalho : 0;
  const totalProvisoes = ipvaDiaria + manutDiaria + seguroDiario + financDiario;

  const lucroLiquido = lucroBruto - totalProvisoes;
  const horasAtivas = tempoAtivo / 3600;
  const mediaHoraLiquida = horasAtivas > 0 ? lucroLiquido / horasAtivas : 0;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const record = {
        user_id: user.id,
        date: new Date().toISOString().split("T")[0],
        shift_session_id: shiftId || null,
        uber_rides: uberRides,
        uber_amount: uberAmount,
        ninety_nine_rides: nnRides,
        ninety_nine_amount: nnAmount,
        indrive_rides: indriveRides,
        indrive_amount: indriveAmount,
        private_rides: privateRides,
        private_amount: privateAmount,
        total_faturamento: totalFaturamento,
        km_total: kmTotal,
        gasto_combustivel: gastoCombustivel,
        gasto_alimentacao: gastoAlimentacao,
        gasto_outros: gastoOutros,
        total_gastos_variaveis: totalGastosVariaveis,
        lucro_bruto: lucroBruto,
        provisao_ipva_diaria: ipvaDiaria,
        provisao_manutencao_diaria: manutDiaria,
        provisao_seguro_diaria: seguroDiario,
        custo_financiamento_diario: financDiario,
        lucro_liquido: lucroLiquido,
        media_hora_liquida: mediaHoraLiquida,
        tempo_ativo_segundos: tempoAtivo,
      };

      const { error } = await supabase.from("daily_records").insert(record);
      if (error) throw error;

      toast({ title: "Dia finalizado! ✅", description: `Lucro líquido: ${fmt(lucroLiquido)}`, duration: 3000 });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
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
      <div className="container mx-auto max-w-lg px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-foreground text-center">Finalizar Dia</h1>

        {/* Faturamento por plataforma */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> Faturamento por Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Uber", rides: uberRides, setRides: setUberRides, amount: uberAmount, setAmount: setUberAmount },
              { label: "99", rides: nnRides, setRides: setNnRides, amount: nnAmount, setAmount: setNnAmount },
              { label: "InDrive", rides: indriveRides, setRides: setIndriveRides, amount: indriveAmount, setAmount: setIndriveAmount },
              { label: "Particular", rides: privateRides, setRides: setPrivateRides, amount: privateAmount, setAmount: setPrivateAmount },
            ].map(({ label, rides, setRides, amount, setAmount }) => (
              <div key={label} className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Corridas</Label>
                  <Input type="number" min={0} value={rides || ""} onChange={(e) => setRides(Number(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                  <Input type="number" min={0} step={0.01} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value) || 0)} placeholder="0,00" />
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">Total faturamento</span>
              <span className="text-sm font-bold text-primary">{fmt(totalFaturamento)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Km e gastos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-5 w-5 text-primary" /> Km e Gastos do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Km total rodado</Label>
              <Input type="number" min={0} step={0.1} value={kmTotal || ""} onChange={(e) => setKmTotal(Number(e.target.value) || 0)} placeholder="0" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Fuel className="h-3 w-3" /> Combustível</Label>
                <Input type="number" min={0} step={0.01} value={gastoCombustivel || ""} onChange={(e) => setGastoCombustivel(Number(e.target.value) || 0)} placeholder="0,00" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><UtensilsCrossed className="h-3 w-3" /> Alimentação</Label>
                <Input type="number" min={0} step={0.01} value={gastoAlimentacao || ""} onChange={(e) => setGastoAlimentacao(Number(e.target.value) || 0)} placeholder="0,00" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><ReceiptText className="h-3 w-3" /> Outros</Label>
                <Input type="number" min={0} step={0.01} value={gastoOutros || ""} onChange={(e) => setGastoOutros(Number(e.target.value) || 0)} placeholder="0,00" />
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">Total gastos</span>
              <span className="text-sm font-bold text-destructive">{fmt(totalGastosVariaveis)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" /> Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faturamento</span>
              <span className="font-medium">{fmt(totalFaturamento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gastos variáveis</span>
              <span className="font-medium text-destructive">- {fmt(totalGastosVariaveis)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lucro bruto</span>
              <span className="font-bold">{fmt(lucroBruto)}</span>
            </div>
            {totalProvisoes > 0 && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Provisões (IPVA + manutenção + seguro + financ.)</span>
                  <span className="text-destructive">- {fmt(totalProvisoes)}</span>
                </div>
                <Separator />
              </>
            )}
            <div className="flex justify-between text-base">
              <span className="font-semibold">Lucro líquido</span>
              <span className={`font-bold ${lucroLiquido >= 0 ? "text-primary" : "text-destructive"}`}>
                {fmt(lucroLiquido)}
              </span>
            </div>
            {horasAtivas > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Média/hora líquida</span>
                <span>{fmt(mediaHoraLiquida)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full h-14 text-lg rounded-xl" size="lg">
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
          Salvar e Finalizar
        </Button>
      </div>
    </Layout>
  );
}
