import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Settings } from "./Settings";
import { useSubscription } from "../hooks/useSubscription";

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
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">(
    "dashboard",
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ name: "", service: "" });
  const [salonName, setSalonName] = useState("Carregando..."); // Valor padrão

  const { isAccessAllowed, loading: loadingSubscription } =
    useSubscription(salonId);

  // Deve ficar assim para o trabalhador ver tudo do salão:
  // Na Dashboard.tsx, a função fetchBookings deve ser:
  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings") // Garante que é a mesma tabela onde o cliente insere
      .select("*")
      .eq("salon_id", salonId)
      // NUNCA filtres por user_id aqui, senão o trabalhador só vê o que ele mesmo criou
      .order("created_at", { ascending: true });
    setBookings(data || []);
    setLoadingBookings(false);
  };

  useEffect(() => {
    // Exemplo de lógica para buscar o nome do salão
const fetchSalonName = async () => {
  const { data } = await supabase
    .from("salons")
    .select("salon_name")
    .eq("owner_id", "user_id") // Usa o ID do utilizador logado
    .single();
    
  if (data) setSalonName(data.salon_name);
};
    if (!isAccessAllowed) return;
    fetchBookings();
  }, [salonId, isAccessAllowed]);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "waiting" ? "completed" : "waiting";
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setBookings(
        bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      );
    }
  };

  // Função para o trabalhador atualizar o tempo manualmente
  const handleUpdateEstimatedTime = async (id: string, time: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ estimated_time: time })
      .eq("id", id);

    if (!error) {
      fetchBookings();
    } else {
      alert("Erro ao definir tempo: " + error.message);
    }
  };

  const saveManualBooking = async () => {
    // REMOVIDO o estimated_time do insert para evitar erro de sintaxe
    const { error } = await supabase.from("bookings").insert([
      {
        salon_id: salonId,
        customer_name: newBooking.name,
        service_type: newBooking.service,
        status: "pending",
        booking_date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (error) {
      alert("Erro ao agendar: " + error.message);
    } else {
      setIsModalOpen(false);
      setNewBooking({ name: "", service: "" });
      fetchBookings();
    }
  };

  if (loadingSubscription) return <div>A carregar...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 border-r border-slate-800 p-6">
<h1 className="text-xl font-bold mb-8 text-saloom-500">{salonName}</h1>
        <button
          onClick={() => setActiveTab("dashboard")}
          className="block w-full text-left p-2 hover:bg-slate-900 rounded"
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className="block w-full text-left p-2 hover:bg-slate-900 rounded"
        >
          Configurações
        </button>
        <button onClick={onLogout} className="text-red-500 p-2 mt-4">
          Sair
        </button>
      </aside>

      <main className="flex-1 p-6">
        {activeTab === "dashboard" && (
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-saloom-500 p-3 rounded-xl font-bold"
            >
              + Novo Agendamento
            </button>
            <div className="mt-6 space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 border border-slate-800 rounded-xl bg-slate-900/50"
                >
                  <div className="flex justify-between items-center">
                    <h4
                      className={`font-bold ${b.status === "completed" ? "line-through text-slate-500" : "text-white"}`}
                    >
                      {b.customer_name}
                    </h4>
                    <button
                      onClick={() => handleUpdateStatus(b.id, b.status)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold ${b.status === "completed" ? "bg-slate-700" : "bg-emerald-600"}`}
                    >
                      {b.status === "completed" ? "Desfazer" : "✓ Feito"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {b.service_type}
                  </p>

                  {/* Área para o trabalhador definir o tempo */}
                  {!b.estimated_time ? (
                    <input
                      type="text"
                      placeholder="Definir tempo (ex: 45 min)"
                      className="bg-slate-800 text-white text-xs p-1 rounded w-full border border-slate-700"
                      onBlur={(e) =>
                        handleUpdateEstimatedTime(b.id, e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-xs text-saloom-500 font-bold">
                      Tempo estimado: {b.estimated_time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "settings" && <Settings salonId={salonId} />}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-2xl w-80">
            <h2 className="mb-4 font-bold">Novo Agendamento</h2>
            <input
              placeholder="Nome do Cliente"
              className="w-full bg-slate-800 p-2 mb-2 rounded"
              onChange={(e) =>
                setNewBooking({ ...newBooking, name: e.target.value })
              }
            />
            <input
              placeholder="Serviço"
              className="w-full bg-slate-800 p-2 mb-4 rounded"
              onChange={(e) =>
                setNewBooking({ ...newBooking, service: e.target.value })
              }
            />
            <button
              onClick={saveManualBooking}
              className="w-full bg-saloom-500 py-2 rounded font-bold"
            >
              Confirmar
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-2 text-slate-400 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
