import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Scissors, Phone, MapPin, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
  onSuccess: (salonId: string) => void;
}

export function Auth({ onBack, onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [salonName, setSalonName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [salonType, setSalonType] = useState('corte');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- FLUXO DE LOGIN ---
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;
        if (data.user) onSuccess(data.user.id);

      } else {
        // --- FLUXO DE REGISTO ---
        // 1. Criar o utilizador na autenticação do Supabase
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Erro ao criar conta. Tente novamente.');

        // 2. Inserir os dados detalhados na tabela 'salons' ligada ao ID criado
        const { error: profileError } = await supabase.from('salons').insert([
          {
            id: authData.user.id,
            owner_name: ownerName,
            salon_name: salonName,
            phone: phone,
            location: location,
            salon_type: salonType,
            // subscription_status e trial_ends_at são automáticos por padrão no SQL
          },
        ]);

        if (profileError) throw profileError;

        alert('Conta criada com sucesso! Verifique o seu email para confirmar o acesso.');
        onSuccess(authData.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      {/* Botão Voltar */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-saloom-500 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Voltar ao início</span>
      </button>

      {/* Caixa do Formulário */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {isLogin ? 'Aceder ao Painel' : 'Cadastrar Meu Salão'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isLogin ? 'Faça login para gerir as suas bichas' : 'Ganhe 3 dias de testes logo após o registo'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CAMPOS ADICIONAIS SÓ PARA REGISTO */}
          {!isLogin && (
            <>
              {/* Nome do Dono */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Mateus Matusse"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
                  />
                </div>
              </div>

              {/* Nome do Salão */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nome do Salão</label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text" required value={salonName} onChange={(e) => setSalonName(e.target.value)}
                    placeholder="Ex: MY SALOOM Muhalaze"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
                  />
                </div>
              </div>

              {/* Número de Telefone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +258 853 894 337"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
                  />
                </div>
              </div>

              {/* Localização */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Localização do Salão</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Bairro de Muhalaze, Paragem cajueiro"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
                  />
                </div>
              </div>

              {/* Tipo de Salão */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tipo de Estabelecimento</label>
                <select
                  value={salonType} onChange={(e) => setSalonType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
                >
                  <option value="corte">Corte (Barbearia)</option>
                  <option value="beleza">Beleza (Cabeleireiro)</option>
                  <option value="unissexo">Unissexo</option>
                  <option value="unhas">Unhas (Nail Designer)</option>
                </select>
              </div>
            </>
          )}

          {/* CAMPOS COMUNS (EMAIL E PALAVRA-PASSE) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Palavra-passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-saloom-500"
              />
            </div>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-saloom-500 hover:bg-saloom-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm mt-6 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isLogin ? (
              'Entrar no Painel'
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>

        {/* Alternador entre Login e Registo */}
        <div className="mt-6 text-center text-xs">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-slate-500 dark:text-slate-400 hover:text-saloom-500 font-medium cursor-pointer"
          >
            {isLogin ? 'Não tem conta? Cadastre o seu salão aqui' : 'Já tem conta cadastrada? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}