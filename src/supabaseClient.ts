import { createClient } from '@supabase/supabase-js';

// Captura as variáveis de ambiente configuradas no .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pequena validação de segurança para garantir que não te esqueceste de preencher o .env
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase no ficheiro .env.local');
}

// Inicializa e exporta o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);