import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Settings } from "./Settings";
import { Payments } from "./Payments";
import { useSubscription } from "../hooks/useSubscription";
import {
  Plus,
  LayoutDashboard,
  Sliders,
  CreditCard,
  LogOut,
  Calendar as CalendarIcon,
} from "lucide-react";

interface DashboardProps {
  salonId: string;
  onLogout: () => void;
}

interface Booking {
  id: string;
  customer_name: string;
  service_type: string;
  status: string;
  booking_date: string;
  estimated_time: string | null;
  created_at: string;
}

export function Dashboard({ salonId, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "settings" | "payments"
  >("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Hook customizado que criámos para controlar o bloqueio/acesso da licença
  const {
    isAccessAllowed,
    status,
    daysRemaining,
    loading: loadingSubscription,
  } = useSubscription(salonId);

  // Carregar agendamentos apenas se o acesso for permitido
  useEffect(() => {
    if (!isAccessAllowed) return;

    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("salon_id", salonId)
          .order("booking_date", { ascending: true });

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Erro ao carregar agendamentos:", err);
      } finally {
        setLoadingBookings(false);
      }
    }

    fetchBookings();
  }, [salonId, isAccessAllowed]);

  // 1. Estado de carregamento inicial do sistema (validação de licença)
  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center text-sm font-medium text-slate-500">
        A validar licença de acesso...
      </div>
    );
  }

  // 2. Bloqueio absoluto: Se a licença expirou, renderiza APENAS a aba de pagamentos e o botão de logout
  if (!isAccessAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between">
        <div className="w-full">
          <Payments
            salonId={salonId}
            currentStatus={status}
            daysRemaining={daysRemaining}
          />
        </div>
        <div className="text-center pb-8">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  const handleCreateManualBooking = () => {
    const customerName = prompt("Nome do cliente:");
    const serviceType = prompt("Serviço (ex: Corte, Barba):");

    if (customerName && serviceType) {
      saveManualBooking(customerName, serviceType);
    }
  };

  const saveManualBooking = async (name: string, service: string) => {
    const { error } = await supabase
      .from("bookings") // Certifica-te que o nome da tabela é 'bookings' conforme o teu fetch
      .insert([
        {
          salon_id: salonId,
          customer_name: name,
          service_type: service, // Nota: corrige conforme a coluna real
          status: "waiting",
          booking_date: new Date().toISOString().split("T")[0], // Data de hoje
        },
      ]);

    if (error) {
      alert("Erro ao criar agendamento: " + error.message);
    } else {
      alert("Agendamento criado com sucesso!");
      // Opcional: Recarregar a lista de bookings aqui
      window.location.reload();
    }
  };

  // 3. Fluxo Normal: Utilizador ativo ou em período de teste válido
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Barra Lateral de Navegação */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo / Nome do App */}
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 bg-saloom-500 rounded-xl flex items-center justify-center font-black text-white text-sm">
              S
            </div>
            <span className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider">
              My Saloom
            </span>
          </div>

          {/* Itens do Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-colors cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-saloom-500 text-white shadow-lg shadow-saloom-500/10"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-colors cursor-pointer ${
                activeTab === "settings"
                  ? "bg-saloom-500 text-white shadow-lg shadow-saloom-500/10"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders size={18} /> Configurações
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-colors cursor-pointer ${
                activeTab === "payments"
                  ? "bg-saloom-500 text-white shadow-lg shadow-saloom-500/10"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CreditCard size={18} /> Subscrição
              {status === "trial" && (
                <span className="ml-auto text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md">
                  {daysRemaining}d
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Botão Sair no Rodapé da Sidebar */}
        <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors cursor-pointer"
          >
            <LogOut size={18} /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Conteúdo Dinâmico das Abas */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Cabeçalho Interno */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  Fila de Espera
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gerencie os clientes agendados e os que estão na bicha.
                </p>
              </div>
              <button className="flex items-center justify-center gap-2 px-5 py-3 bg-saloom-500 hover:bg-saloom-600 text-white text-xs font-bold rounded-2xl shadow-md transition-colors cursor-pointer">
                <Plus size={16} /> Novo Agendamento
              </button>
            </div>

            {/* Lista de Clientes / Bichas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon size={16} className="text-saloom-500" /> Próximos
                Clientes
              </h3>

              {loadingBookings ? (
                <div className="text-center py-12 text-xs font-semibold text-slate-400">
                  A carregar bicha atual...
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 font-medium">
                  Nenhum cliente agendado para hoje.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                          {booking.customer_name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {booking.service_type} •{" "}
                          {booking.estimated_time || "Sem hora"}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          booking.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : booking.status === "canceled"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && <Settings salonId={salonId} />}
        {activeTab === "payments" && (
          <Payments
            salonId={salonId}
            currentStatus={status}
            daysRemaining={daysRemaining}
          />
        )}
      </main>
    </div>
  );
}
