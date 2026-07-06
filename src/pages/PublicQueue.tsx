import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function PublicQueue({ salonId }: { salonId: string }) {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchTodayBookings = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("salon_id", salonId)
        .eq("booking_date", today)
        .order("created_at", { ascending: true }); // Quem chegou primeiro fica no topo
      setBookings(data || []);
    };
    fetchTodayBookings();
  }, [salonId]);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6 text-saloom-500">Bicha do Dia</h2>
      <div className="space-y-4">
        {bookings.map((b, index) => (
          <div
            key={b.id}
            className="p-4 border border-slate-800 rounded-lg flex justify-between items-center"
          >
            <div>
              <span className="text-slate-500 font-mono mr-4">
                #{index + 1}
              </span>
              <span className="font-bold">{b.customer_name}</span>
              <p className="text-xs text-slate-400">{b.service_type}</p>
            </div>
            {b.status === "completed" && (
              <span className="text-emerald-500 text-xs font-bold">
                Atendido
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
