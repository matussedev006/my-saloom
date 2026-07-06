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
  const [totalEstimatedTime, setTotalEstimatedTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({ name: "", service: "" });

  const { isAccessAllowed, loading: loadingSubscription } =
    useSubscription(salonId);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: true });

    if (data) {
      setBookings(data);
      // Calcula o tempo inicial apenas dos clientes em espera
      const total = data
        .filter((b) => b.status === "waiting" && b.estimated_time)
        .reduce((acc, curr) => acc + parseInt(curr.estimated_time || "0"), 0);
      setTotalEstimatedTime(total);
    }
  };

  useEffect(() => {
    if (!isAccessAllowed) return;
    fetchBookings();
  }, [salonId, isAccessAllowed]);

  const handleUpdateStatus = async (
    id: string,
    currentStatus: string,
    time: string | null,
  ) => {
    const newStatus = currentStatus === "waiting" ? "completed" : "waiting";
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // Atualiza a lista local
      setBookings(
        bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      );

      // Atualiza o tempo total da bicha dinamicamente
      const timeValue = parseInt(time || "0");
      setTotalEstimatedTime((prev) =>
        newStatus === "completed" ? prev - timeValue : prev + timeValue,
      );
    }
  };

  const handleUpdateEstimatedTime = async (id: string, time: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ estimated_time: time })
      .eq("id", id);

    if (!error) {
      fetchBookings(); // Recarrega para recalcular o tempo total
    } else {
      alert("Erro ao definir tempo: " + error.message);
    }
  };

  const saveManualBooking = async () => {
    const { error } = await supabase.from("bookings").insert([
      {
        salon_id: salonId,
        customer_name: newBooking.name,
        service_type: newBooking.service,
        status: "waiting",
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

  if (loadingSubscription) return <div>@mysaloom</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 border-r border-slate-800 p-6">
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
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-saloom-500 p-3 rounded-xl font-bold"
              >
                + Novo Agendamento
              </button>

              {/* Contador de tempo da bicha */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Tempo total na bicha
                </p>
                <p className="text-xl font-black text-saloom-500">
                  {totalEstimatedTime} min
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 border rounded-xl ${b.status === "completed" ? "border-slate-800 bg-slate-900/20" : "border-slate-800 bg-slate-900/50"}`}
                >
                  <div className="flex justify-between items-center">
                    <h4
                      className={`font-bold ${b.status === "completed" ? "line-through text-slate-500" : "text-white"}`}
                    >
                      {b.customer_name}
                    </h4>
                    <button
                      onClick={() =>
                        handleUpdateStatus(b.id, b.status, b.estimated_time)
                      }
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold ${b.status === "completed" ? "bg-slate-700 text-slate-300" : "bg-emerald-600 text-white"}`}
                    >
                      {b.status === "completed" ? "Desfazer" : "✓ Feito"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {b.service_type}
                  </p>

                  {!b.estimated_time ? (
                    <input
                      type="text"
                      placeholder="Tempo (min)"
                      className="bg-slate-800 text-white text-xs p-1 rounded w-full border border-slate-700"
                      onBlur={(e) =>
                        handleUpdateEstimatedTime(b.id, e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-xs text-saloom-500 font-bold">
                      Tempo estimado: {b.estimated_time} min
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
              placeholder="Nome"
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
          </div>
        </div>
      )}
    </div>
  );
}
