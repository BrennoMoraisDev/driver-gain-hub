import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const FREE_ROUTES = ["/assinar", "/perfil", "/configuracoes"];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasAccess } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Allow free routes regardless of subscription
  if (FREE_ROUTES.some((r) => location.pathname.startsWith(r))) {
    return <>{children}</>;
  }

  // Check subscription access via AuthContext
  if (!hasAccess) {
    return <Navigate to="/assinar" replace />;
  }

  return <>{children}</>;
}
