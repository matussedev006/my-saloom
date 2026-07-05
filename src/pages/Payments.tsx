import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Copy,
} from "lucide-react";

interface PaymentsProps {
  salonId: string;
  currentStatus: "trial" | "active" | "expired";
  daysRemaining: number;
}

export function Payments({ currentStatus, daysRemaining }: PaymentsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Estado da Subscrição */}
      <div className="mb-8">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Subscrição & Pagamentos
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Gira o acesso ao teu sistema e mantém a tua conta ativa.
        </p>
      </div>

      {/* Alertas de Estado */}
      {currentStatus === "expired" && (
        <div className="mb-8 p-5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-red-800 dark:text-red-400">
              O teu período de testes expirou!
            </h4>
            <p className="text-xs text-red-600 dark:text-red-500/80 mt-1">
              Para continuar a registar clientes, gerir a agenda e ver as
              finanças do teu salão, efetua o pagamento da subscrição mensal
              abaixo.
            </p>
          </div>
        </div>
      )}

      {currentStatus === "trial" && (
        <div className="mb-8 p-5 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
              Modo de Teste Ativo
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-500/80 mt-1">
              Ainda tens <strong>{daysRemaining} dias</strong> de acesso
              gratuito. Podes carregar a tua subscrição a qualquer momento para
              evitar bloqueios.
            </p>
          </div>
        </div>
      )}

      {currentStatus === "active" && (
        <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-4">
          <CheckCircle2
            className="text-emerald-500 shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
              Subscrição Ativa
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-500/80 mt-1">
              O teu sistema está totalmente operacional. Obrigado por confiar no
              My Saloom!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cartão do Plano */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-saloom-500/10 text-saloom-500 px-3 py-1 rounded-full">
              Mensal
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-4">
              Plano Completo
            </h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                120
              </span>
              <span className="text-xs font-bold text-slate-400">MT / mês</span>
            </div>

            <ul className="space-y-3 mt-6">
              {[
                "Agendamentos ilimitados",
                "Gestão de trabalhadores",
                "Relatórios financeiros",
                "Suporte técnico via WhatsApp",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle2
                    size={14}
                    className="text-saloom-500 shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Apenas Carteiras Móveis */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard size={18} className="text-saloom-500" /> Transferência
            via Carteira Móvel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* M-Pesa */}
            <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Smartphone size={14} /> M-Pesa
              </span>
              <div>
                <div className="flex items-center justify-between mt-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                    853894337
                  </span>
                  <button
                    onClick={() => copyToClipboard("853894337", "mpesa")}
                    className="text-slate-400 hover:text-saloom-500 cursor-pointer"
                  >
                    {copiedField === "mpesa" ? (
                      <span className="text-[10px] text-emerald-500 font-bold">
                        Copiado!
                      </span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 italic">
                  Titular: Eufrásio Pedro Matusse
                </p>
              </div>
            </div>

            {/* e-Mola */}
            <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Smartphone size={14} /> e-Mola
              </span>
              <div>
                <div className="flex items-center justify-between mt-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                    861175799
                  </span>
                  <button
                    onClick={() => copyToClipboard("861175799", "emola")}
                    className="text-slate-400 hover:text-saloom-500 cursor-pointer"
                  >
                    {copiedField === "emola" ? (
                      <span className="text-[10px] text-emerald-500 font-bold">
                        Copiado!
                      </span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 italic">
                  Titular: Eufrásio Pedro Matusse
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
            <p className="text-xs text-slate-500">
              Após efetuar a transferência, envie o comprovativo para o nosso
              WhatsApp para a ativação imediata do seu salão.
            </p>
            <a
              href="https://wa.me/258861175799?text=Envio%20de%20comprovativo%20My%20Saloom"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 px-5 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              Confirmar via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
