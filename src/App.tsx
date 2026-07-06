import { useState, useEffect } from "react";
// Remove as chavetas { }
import {Search} from "./pages/Search";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Scissors, Sun, Moon } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [view, setView] = useState<"landing" | "search" | "login" | "register" | "dashboard">("landing");
  const [userSalonId, setUserSalonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
             (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  function handleAuthSuccess(id: string) {
    setUserSalonId(id);
    setView("dashboard");
  }

  function handleLogout() {
    supabase.auth.signOut();
    setUserSalonId(null);
    setView("landing");
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserSalonId(session.user.id);
        setView("dashboard");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserSalonId(session.user.id);
        setView("dashboard");
      } else {
        setUserSalonId(null);
        setView("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => setView(userSalonId ? "dashboard" : "landing")}
            className="flex items-center gap-2 cursor-pointer font-black text-2xl tracking-wider text-slate-900 dark:text-white"
          >
            <div className="p-2 bg-saloom-500 rounded-xl text-white shadow-md shadow-saloom-500/20">
              <Scissors size={20} />
            </div>
            <span>
              MY <span className="text-saloom-500">SALOOM</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            >
              {darkMode ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {view === "landing" && !userSalonId && (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => setView("login")}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-saloom-500 transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setView("register")}
                  className="px-4 py-2 text-sm font-semibold bg-saloom-500 hover:bg-saloom-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {view === "search" ? (
          <Search
            onBack={() => setView(userSalonId ? "dashboard" : "landing")}
          />
        ) : view === "login" || view === "register" ? (
          <Auth
            onBack={() => setView("landing")}
            onSuccess={handleAuthSuccess}
          />
        ) : view === "dashboard" && userSalonId ? (
          <Dashboard salonId={userSalonId} onLogout={handleLogout} />
        ) : (
          <div className="animate-fade-in">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center lg:pt-24">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-saloom-100 dark:bg-saloom-900/30 text-saloom-600 dark:text-saloom-400 mb-4 tracking-wide uppercase">
                Feito exclusivamente para o seu Salão!
              </span>
              <h1 className="mx-auto max-w-4xl font-black tracking-tight text-4xl sm:text-6xl text-slate-900 dark:text-white leading-none">
                Chega de enchentes e <br className="hidden sm:inline" />
                <span className="text-saloom-500">bichas intermináveis</span> no
                seu salão!
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                Organize o atendimento do seu salão de forma simples e super
                rápida. Deixe o seu cliente marcar a bicha pelo celular e saiba
                exatamente quem atender.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setView("register")}
                  className="w-full sm:w-auto px-8 py-4 font-bold text-white bg-saloom-500 hover:bg-saloom-600 rounded-2xl shadow-lg shadow-saloom-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer text-lg"
                >
                  Cadastrar Meu Salão (3 dias grátis)
                </button>

                <button
                  onClick={() => setView("search")}
                  className="w-full sm:w-auto px-8 py-4 font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-saloom-500 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-lg"
                >
                  Procura um salão? Marque já aqui
                </button>
              </div>
            </section>
            <section className="py-12 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/20 text-center text-sm text-slate-500">
              Diga adeus às filas desorganizadas no seu estabelecimento. Teste
              agora o MY SALOOM.
            </section>
          </div>
        )}
      </main>

      {view !== "dashboard" && (
        <footer className="w-full border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-md font-bold text-slate-800 dark:text-slate-300 mb-6">
              Tenha o controle dos seus clientes na palma da sua mão.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm mb-8">
              <button
                onClick={() => setView("login")}
                className="font-bold text-slate-600 dark:text-slate-400 hover:text-saloom-500 cursor-pointer"
              >
                Já tenho uma conta (Entrar)
              </button>
              <span className="text-slate-300 dark:text-slate-800">|</span>
              <button
                onClick={() => setView("register")}
                className="font-bold text-saloom-500 hover:text-saloom-600 cursor-pointer"
              >
                Criar Nova Conta de Salão
              </button>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-600">
              &copy; {new Date().getFullYear()} MY SALOOM. Desenvolvido por
              Corporation Mathusse. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}