import { useState, useEffect } from "react";
import { Search as SearchIcon, MapPin, User, ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";

interface SearchProps {
  onBack: () => void;
}

export function Search({ onBack }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [salons, setSalons] = useState<any[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [viewingQueue, setViewingQueue] = useState<string | null>(null);
  const [queueList, setQueueList] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [serviceType, setServiceType] = useState("");

  const fetchSalons = async (query: string) => {
    let queryBuilder = supabase.from("salons").select("*");
    if (query) {
      queryBuilder = queryBuilder.or(
        `salon_name.ilike.%${query}%,owner_name.ilike.%${query}%,location.ilike.%${query}%`,
      );
    }
    const { data, error } = await queryBuilder.limit(6);
    if (error) console.error("Erro:", error);
    else setSalons(data || []);
  };

  // Tenta isto temporariamente para validar:
  const fetchQueue = async (salonId: string) => {
    const { data, error } = await supabase
      .from("bookings") // Garante que usas a mesma tabela 'bookings'
      .select("*")
      .eq("salon_id", salonId)
      // .gte("created_at", ...) // COMENTA ESTA LINHA E VÊ SE APARECE
      .order("created_at", { ascending: true });

    console.log("Dados recebidos:", data); // Abre o console (F12) e vê se os nomes estão aqui
    setQueueList(data || []);
    setViewingQueue(salonId);
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchSalons(searchQuery), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const confirmBooking = async () => {
    if (!clientName || !serviceType || !bookingId) {
      alert("Por favor, preencha o nome e o serviço.");
      return;
    }

    const newBooking = {
      salon_id: bookingId,
      customer_name: clientName,
      service_type: serviceType,
      status: "waiting",
    };

    // Altera de "queue" para "bookings"
    const { error } = await supabase.from("bookings").insert([newBooking]);

    if (error) {
      console.error("Erro Supabase:", error);
      alert("Erro ao marcar bicha: " + error.message);
    } else {
      alert("Bicha marcada com sucesso!");
      fetchQueue(bookingId); // Abre a fila automaticamente após marcar
      setBookingId(null);
      setClientName("");
      setServiceType("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-saloom-500 mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} /> <span>Voltar ao início</span>
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white">
          Encontre o seu <span className="text-saloom-500">Salão Favorito</span>
        </h1>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <SearchIcon
          className="absolute left-4 top-4 text-slate-400"
          size={22}
        />
        <input
          type="text"
          placeholder="Ex: Salão Estilo, Mateus..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-slate-700 rounded-2xl bg-slate-900 text-white focus:ring-2 focus:ring-saloom-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {salons.map((salon) => (
          <div
            key={salon.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
          >
            {bookingId === salon.id ? (
              <div className="space-y-3">
                <input
                  placeholder="Teu Nome"
                  className="w-full p-2 bg-slate-800 text-white rounded border border-slate-700"
                  onChange={(e) => setClientName(e.target.value)}
                />
                <input
                  placeholder="Serviço (ex: Corte)"
                  className="w-full p-2 bg-slate-800 text-white rounded border border-slate-700"
                  onChange={(e) => setServiceType(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={confirmBooking}
                    className="flex-1 bg-saloom-500 text-white py-2 rounded-xl font-bold"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setBookingId(null)}
                    className="flex-1 bg-slate-700 text-white py-2 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-saloom-500 text-xs font-bold uppercase tracking-wider">
                  Corte
                </span>
                <h3 className="text-xl font-bold text-white mt-1 mb-3">
                  {salon.salon_name}
                </h3>
                <p className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                  <User size={14} /> Dono: {salon.owner_name}
                </p>
                <p className="text-sm text-slate-400 flex items-center gap-2 mb-6">
                  <MapPin size={14} /> {salon.location}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => setBookingId(salon.id)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-saloom-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Marcar Bicha
                  </button>
                  <button
                    onClick={() => fetchQueue(salon.id)}
                    className="w-full py-2 bg-slate-950 border border-slate-700 text-slate-400 text-sm rounded-xl"
                  >
                    Ver Fila do Dia
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {viewingQueue && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              Estimativa:{" "}
              {queueList.reduce((acc, item) => {
                const tempo =
                  parseInt(
                    String(item.estimated_time || 0).replace(/\D/g, ""),
                    10,
                  ) || 0;
                return acc + tempo;
              }, 0)}{" "}
              min
            </h2>

            <ul className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {queueList.map((item, i) => (
                <li
                  key={item.id}
                  className="text-slate-200 border-b border-slate-800 pb-2"
                >
                  {i + 1}.{" "}
                  {item.customer_name || item.customer_name || "Sem nome"}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setViewingQueue(null)}
              className="w-full py-2 bg-saloom-500 text-white rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
