import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, DollarSign, TrendingUp, Fuel, Clock, Car, Download, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyRecord {
  id: string;
  date: string;
  uber_rides: number;
  uber_amount: number;
  ninety_nine_rides: number;
  ninety_nine_amount: number;
  indrive_rides: number;
  indrive_amount: number;
  private_rides: number;
  private_amount: number;
  total_faturamento: number;
  km_total: number;
  gasto_combustivel: number;
  gasto_alimentacao: number;
  gasto_outros: number;
  total_gastos_variaveis: number;
  lucro_bruto: number;
  provisao_ipva_diaria: number;
  provisao_manutencao_diaria: number;
  provisao_seguro_diaria: number;
  custo_financiamento_diario: number;
  lucro_liquido: number;
  media_hora_liquida: number;
  tempo_ativo_segundos: number;
}

type Period = "daily" | "weekly" | "monthly" | "annual";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => `${v.toFixed(1)}%`;

const PIE_COLORS = [
  "hsl(142, 64%, 38%)",
  "hsl(213, 32%, 18%)",
  "hsl(0, 84%, 60%)",
  "hsl(45, 93%, 47%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 50%)",
];

function getDateRange(period: Period, refDate: string) {
  const d = parseISO(refDate);
  switch (period) {
    case "daily":
      return { start: refDate, end: refDate };
    case "weekly":
      return {
        start: format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    case "monthly":
      return {
        start: format(startOfMonth(d), "yyyy-MM-dd"),
        end: format(endOfMonth(d), "yyyy-MM-dd"),
      };
    case "annual":
      return {
        start: format(startOfYear(d), "yyyy-MM-dd"),
        end: format(endOfYear(d), "yyyy-MM-dd"),
      };
  }
}

interface VehicleFlags {
  incluir_ipva: boolean;
  incluir_manutencao: boolean;
  incluir_seguro: boolean;
  incluir_financiamento: boolean;
}

export default function Relatorios() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("daily");
  const [refDate, setRefDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [vehicleFlags, setVehicleFlags] = useState<VehicleFlags>({
    incluir_ipva: true,
    incluir_manutencao: true,
    incluir_seguro: true,
    incluir_financiamento: true,
  });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { start, end } = getDateRange(period, refDate);
    const [recordsRes, vehicleRes] = await Promise.all([
      supabase
        .from("daily_records")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true }),
      supabase
        .from("vehicles")
        .select("incluir_ipva, incluir_manutencao, incluir_seguro, incluir_financiamento")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    setRecords((recordsRes.data as DailyRecord[]) || []);
    if (vehicleRes.data) {
      setVehicleFlags(vehicleRes.data as VehicleFlags);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, period, refDate]);

  const handleDelete = async () => {
    if (!deleteId || !user) return;
    setDeleting(true);
    const { error } = await supabase.from("daily_records").delete().eq("id", deleteId).eq("user_id", user.id);
    setDeleting(false);
    setDeleteId(null);
    if (error) return;
    fetchData();
  };

  const summary = useMemo(() => {
    if (!records.length) return null;
    const totalFaturamento = records.reduce((s, r) => s + r.total_faturamento, 0);
    const totalGastosVar = records.reduce((s, r) => s + r.total_gastos_variaveis, 0);
    const totalCombustivel = records.reduce((s, r) => s + r.gasto_combustivel, 0);
    const totalAlimentacao = records.reduce((s, r) => s + r.gasto_alimentacao, 0);
    const totalOutros = records.reduce((s, r) => s + r.gasto_outros, 0);
    const totalIpva = vehicleFlags.incluir_ipva ? records.reduce((s, r) => s + r.provisao_ipva_diaria, 0) : 0;
    const totalManut = vehicleFlags.incluir_manutencao ? records.reduce((s, r) => s + r.provisao_manutencao_diaria, 0) : 0;
    const totalSeguro = vehicleFlags.incluir_seguro ? records.reduce((s, r) => s + r.provisao_seguro_diaria, 0) : 0;
    const totalFinanc = vehicleFlags.incluir_financiamento ? records.reduce((s, r) => s + r.custo_financiamento_diario, 0) : 0;
    const totalCustosFixos = totalIpva + totalManut + totalSeguro + totalFinanc;
    const totalGastos = totalGastosVar + totalCustosFixos;
    const lucroLiquido = totalFaturamento - totalGastos;
    const totalTempo = records.reduce((s, r) => s + r.tempo_ativo_segundos, 0);
    const horasAtivas = totalTempo / 3600;
    const mediaHora = horasAtivas > 0 ? lucroLiquido / horasAtivas : 0;
    const totalCorridas =
      records.reduce((s, r) => s + r.uber_rides + r.ninety_nine_rides + r.indrive_rides + r.private_rides, 0);
    const kmTotal = records.reduce((s, r) => s + r.km_total, 0);

    const pctLucro = totalFaturamento > 0 ? (lucroLiquido / totalFaturamento) * 100 : 0;
    const pctCombustivel = totalGastos > 0 ? (totalCombustivel / totalGastos) * 100 : 0;
    const pctAlimentacao = totalGastos > 0 ? (totalAlimentacao / totalGastos) * 100 : 0;

    const gastosBreakdown = [
      { name: "Combustível", value: totalCombustivel },
      { name: "Alimentação", value: totalAlimentacao },
      { name: "Outros", value: totalOutros },
    ];
    if (vehicleFlags.incluir_ipva) gastosBreakdown.push({ name: "IPVA", value: totalIpva });
    if (vehicleFlags.incluir_manutencao) gastosBreakdown.push({ name: "Manutenção", value: totalManut });
    if (vehicleFlags.incluir_seguro || vehicleFlags.incluir_financiamento) {
      gastosBreakdown.push({ name: "Seguro + Financ.", value: totalSeguro + totalFinanc });
    }

    return {
      totalFaturamento,
      totalGastos,
      lucroLiquido,
      mediaHora,
      totalCorridas,
      kmTotal,
      horasAtivas,
      pctLucro,
      pctCombustivel,
      pctAlimentacao,
      gastosBreakdown: gastosBreakdown.filter((g) => g.value > 0),
    };
  }, [records, vehicleFlags]);

  const chartData = useMemo(() => {
    return records.map((r) => ({
      date: format(parseISO(r.date), "dd/MM", { locale: ptBR }),
      Faturamento: r.total_faturamento,
      Lucro: r.lucro_liquido,
    }));
  }, [records]);

  const exportCSV = () => {
    if (!records.length) return;
    const headers = [
      "Data", "Faturamento", "Gastos Variáveis", "Lucro Bruto", "Lucro Líquido",
      "Km", "Corridas", "Combustível", "Alimentação", "Outros",
    ];
    const rows = records.map((r) => [
      r.date,
      r.total_faturamento.toFixed(2),
      r.total_gastos_variaveis.toFixed(2),
      r.lucro_bruto.toFixed(2),
      r.lucro_liquido.toFixed(2),
      r.km_total.toFixed(1),
      r.uber_rides + r.ninety_nine_rides + r.indrive_rides + r.private_rides,
      r.gasto_combustivel.toFixed(2),
      r.gasto_alimentacao.toFixed(2),
      r.gasto_outros.toFixed(2),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${period}_${refDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodLabel: Record<Period, string> = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
    annual: "Anual",
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-foreground text-center">Relatórios</h1>

        {/* Period selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="annual">Anual</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date picker */}
        <div className="flex items-center gap-3 justify-center">
          <Input
            type="date"
            value={refDate}
            onChange={(e) => setRefDate(e.target.value)}
            className="max-w-[200px]"
          />
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!records.length}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !summary ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum registro encontrado no período selecionado.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <SummaryCard icon={<DollarSign className="h-4 w-4" />} label="Faturamento" value={fmt(summary.totalFaturamento)} color="text-primary" />
              <SummaryCard icon={<Fuel className="h-4 w-4" />} label="Gastos" value={fmt(summary.totalGastos)} color="text-destructive" />
              <SummaryCard icon={<TrendingUp className="h-4 w-4" />} label="Lucro líquido" value={fmt(summary.lucroLiquido)} color={summary.lucroLiquido >= 0 ? "text-primary" : "text-destructive"} />
              <SummaryCard icon={<Clock className="h-4 w-4" />} label="Média/hora" value={fmt(summary.mediaHora)} color="text-foreground" />
              <SummaryCard icon={<Car className="h-4 w-4" />} label="Corridas" value={String(summary.totalCorridas)} color="text-foreground" />
            </div>

            {/* Percentages row */}
            <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
              <span>% Lucro: <strong className="text-foreground">{pct(summary.pctLucro)}</strong></span>
              <span>Km total: <strong className="text-foreground">{summary.kmTotal.toFixed(1)} km</strong></span>
              <span>Horas ativas: <strong className="text-foreground">{summary.horasAtivas.toFixed(1)}h</strong></span>
            </div>

            {/* Charts */}
            {chartData.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Evolução – Faturamento vs Lucro</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        formatter={(value: number) => fmt(value)}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      />
                      <Bar dataKey="Faturamento" fill="hsl(142, 64%, 38%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Lucro" fill="hsl(213, 32%, 18%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {summary.gastosBreakdown.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Composição dos Gastos</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.gastosBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {summary.gastosBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value: number) => fmt(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Detail table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detalhamento ({periodLabel[period]})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Gastos</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                      <TableHead className="text-right">Corridas</TableHead>
                      <TableHead className="text-right">Km</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(parseISO(r.date), "dd/MM/yy")}</TableCell>
                        <TableCell className="text-right">{fmt(r.total_faturamento)}</TableCell>
                        <TableCell className="text-right text-destructive">{fmt(r.total_gastos_variaveis)}</TableCell>
                        <TableCell className={`text-right font-medium ${r.lucro_liquido >= 0 ? "text-primary" : "text-destructive"}`}>
                          {fmt(r.lucro_liquido)}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.uber_rides + r.ninety_nine_rides + r.indrive_rides + r.private_rides}
                        </TableCell>
                        <TableCell className="text-right">{r.km_total.toFixed(1)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => navigate(`/finalizar-dia?id=${r.id}`)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(r.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O registro diário será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center space-y-1">
        <div className="flex items-center justify-center gap-1 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
