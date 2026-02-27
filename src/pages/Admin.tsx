import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity } from "lucide-react";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminEvents from "./admin/AdminEvents";

export default function Admin() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-1">
              <Activity className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1">
              <Users className="h-4 w-4" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1">
              <Activity className="h-4 w-4" /> Eventos Kiwify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="events"><AdminEvents /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
