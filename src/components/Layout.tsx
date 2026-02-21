import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with gradient */}
      <header
        className="w-full"
        style={{
          background: "linear-gradient(135deg, hsl(224, 55%, 33%), hsl(224, 76%, 53%))",
        }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Motorista no Lucro"
              className="h-[50px] w-auto sm:h-[60px] object-contain"
            />
            <span
              className="text-lg sm:text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Motorista no Lucro
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {profile?.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name}
                    className="h-9 w-9 rounded-full border-2 border-white/30 object-cover"
                  />
                ) : (
                  <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                    {(profile?.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-sm text-white/80">
                  {profile?.name || profile?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="mr-1 h-4 w-4" />
                  Entrar
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
