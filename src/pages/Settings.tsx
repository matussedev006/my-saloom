import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { User, Building2, Smartphone, MapPin, Save, CheckCircle, Camera } from 'lucide-react';

interface SettingsProps {
  salonId: string;
}

export function Settings({ salonId }: SettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do Salão
  const [ownerName, setOwnerName] = useState('');
  const [salonName, setSalonName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadSalonData() {
      try {
        const { data, error: fetchError } = await supabase
          .from('salons')
          .select('*')
          .eq('id', salonId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setOwnerName(data.owner_name || '');
          setSalonName(data.salon_name || '');
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSalonData();
  }, [salonId]);

  // Função para fazer Upload da Imagem Real para o Supabase Storage
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setError(null);

    try {
      // 1. Faz o upload do ficheiro para o bucket 'avatars' usando o ID do salão como nome
      const fileExt = file.name.split('.').pop();
      const filePath = `${salonId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Pega no link público da imagem que acabou de ser enviada
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualiza logo o estado e a base de dados com o link real
      setAvatarUrl(publicUrl);
      await supabase.from('salons').update({ avatar_url: publicUrl }).eq('id', salonId);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Atualizar os restantes dados de texto
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('salons')
        .update({
          owner_name: ownerName,
          salon_name: salonName,
          phone: phone,
          location: location,
        })
        .eq('id', salonId);

      if (updateError) throw updateError;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Iniciais dinâmicas caso não haja foto no Supabase
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(salonName || 'My Saloom')}&background=F43F5E&color=fff&bold=true&rounded=true&size=128`;

  if (loading) return <div className="text-center py-10 text-sm text-slate-500">A carregar...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
        
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Configurações do Salão</h2>
          <p className="text-xs text-slate-500 mt-1">Gira o logótipo oficial e dados públicos do teu salão.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl text-xs font-semibold text-red-600">{error}</div>}
        {success && <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-xs font-semibold text-emerald-600 flex items-center gap-2"><CheckCircle size={16} /> Atualizado com sucesso!</div>}

        {/* Upload de Logótipo Real */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-saloom-500/10 bg-slate-100 dark:bg-slate-950">
            <img src={avatarUrl || fallbackAvatar} alt={salonName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={20} />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{salonName}</h3>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-saloom-500 hover:underline mt-1 cursor-pointer">
              Carregar Foto Oficial
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saloom-500 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Nome do Salão</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input type="text" required value={salonName} onChange={(e) => setSalonName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saloom-500 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Contacto</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saloom-500 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saloom-500 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-saloom-500 text-white font-bold rounded-2xl text-sm cursor-pointer hover:bg-saloom-600 transition-colors">
              <Save size={16} />
              {saving ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}