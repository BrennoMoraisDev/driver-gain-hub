import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAIL = "brennomoraisdev@gmail.com";
const FREE_ROUTES = ["/assinar", "/perfil", "/configuracoes"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admin always has access
  if (profile?.email === ADMIN_EMAIL) return <>{children}</>;

  // Allow free routes (subscribe page, profile, settings) regardless of subscription
  if (FREE_ROUTES.some((r) => location.pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Check subscription access
  if (profile) {
    const status = profile.status_assinatura;
    const expDate = profile.data_expiracao ? new Date(profile.data_expiracao) : null;
    const now = new Date();
    const hasAccess =
      (status === "trial" && expDate && expDate > now) ||
      (status === "active" && expDate && expDate > now) ||
      (status === "canceled" && expDate && expDate > now); // canceled but still in paid period

    if (!hasAccess) {
      return <Navigate to="/assinar" replace />;
    }
  }

  return <>{children}</>;
}
