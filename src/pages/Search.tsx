import { useState } from 'react';
import { Search as SearchIcon, MapPin, User, Scissors, Sparkles, ArrowLeft } from 'lucide-react';

interface SearchProps {
  onBack: () => void;
}

export function Search({ onBack }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Dados fictícios para os salões mais pesquisados (recomendações iniciais)
  const recomendados = [
    { id: '1', salon_name: 'Salão Estilo & Corte', owner_name: 'Mateus Matusse', location: 'Bairro de Muhalaze, Paragem cajueiro', salon_type: 'unissexo' },
    { id: '2', salon_name: 'Nail Designer Deluxe', owner_name: 'Anabela Juvêncio', location: 'Fomento, Próximo à Escola', salon_type: 'unhas' },
    { id: '3', salon_name: 'Barbearia do Bairro', owner_name: 'Danilo Santos', location: 'Zimpeto, Terminal do Chapapa', salon_type: 'corte' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Botão Voltar */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-saloom-500 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Voltar ao início</span>
      </button>

      {/* Cabeçalho */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900 dark:text-white">
          Encontre o seu <span className="text-saloom-500">Salão Favorito</span>
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Pesquise pelo nome do salão, proprietário ou localização para marcar a sua bicha hoje mesmo.
        </p>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <SearchIcon size={22} />
        </div>
        <input
          type="text"
          placeholder="Ex: Salão Estilo, Mateus, Muhalaze..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-saloom-500 focus:border-transparent transition-all text-lg"
        />
      </div>

      {/* Secção de Recomendados */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-amber-500" size={20} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Os mais procurados no seu bairro</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recomendados.map((salon) => (
            <div 
              key={salon.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-saloom-100 dark:hover:border-saloom-900/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-saloom-50 dark:bg-saloom-900/20 text-saloom-600 dark:text-saloom-400 capitalize">
                    {salon.salon_type}
                  </span>
                  <Scissors size={16} className="text-slate-400" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-saloom-500">
                  {salon.salon_name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <User size={14} />
                  <span>Dono: {salon.owner_name}</span>
                </div>
                
                <div className="flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-saloom-500" />
                  <span className="line-clamp-2">{salon.location}</span>
                </div>
              </div>

              <button className="mt-6 w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-saloom-500 dark:hover:bg-saloom-500 text-white font-medium rounded-xl transition-colors cursor-pointer text-sm">
                Marcar Bicha
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}