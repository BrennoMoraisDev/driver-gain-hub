import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, User } from "lucide-react";
import Layout from "@/components/Layout";

export default function Perfil() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name || "");
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {};
      if (name) updates.name = name;
      updates.photo_url = photoUrl || null;

      const { error } = await supabase
        .from("profiles")
        .update(updates as any)
        .eq("id", profile.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Perfil atualizado!", description: "Seus dados foram salvos com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-10">
        <Card className="rounded-2xl border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />
              Meu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Foto" className="h-24 w-24 rounded-full border-4 border-primary/20 object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground">
                  {(profile?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={profile?.email || ""} disabled className="rounded-xl bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoUrl">URL da foto</Label>
                <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://i.imgur.com/sua-foto.jpg" className="rounded-xl" />
                <p className="text-xs text-muted-foreground">Cole um link de imagem (ex: Imgur)</p>
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
