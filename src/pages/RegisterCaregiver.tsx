import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Mail, Lock, AlertCircle, KeyRound,
  Search, Building2, ChevronRight, Check, Loader2
} from 'lucide-react';

// Mock centros para búsqueda
const MOCK_CENTROS = [
  { id: '1', nombre: 'Cuido Rayito de Sol', ciudad: 'Santo Domingo' },
  { id: '2', nombre: 'Jardín de los Sueños', ciudad: 'Santiago' },
  { id: '3', nombre: 'Centro Infantil Amiguitos', ciudad: 'La Romana' },
  { id: '4', nombre: 'Nido Feliz', ciudad: 'San Pedro de Macorís' },
];

type Step = 'form' | 'join';
type JoinMethod = 'code' | 'search';

export default function RegisterCaregiver() {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const [step, setStep] = useState<Step>('form');
  const [joinMethod, setJoinMethod] = useState<JoinMethod>('code');

  // Formulario
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Unirse
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCentro, setSelectedCentro] = useState<typeof MOCK_CENTROS[0] | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const upd = (k: keyof typeof form) => (v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const filteredCentros = MOCK_CENTROS.filter(c =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ciudad.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = async () => {
    if (!form.name.trim()) { setError('Ingresa tu nombre completo.'); return; }
    if (!form.email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setError('');
    setLoading(true);
    // Simular registro
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep('join');
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) { setJoinError('Ingresa el código de invitación.'); return; }
    setJoinError('');
    setJoinLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setJoinLoading(false);
    // Simular: código válido si tiene al menos 4 chars
    if (inviteCode.trim().length < 4) {
      setJoinError('Código inválido. Verifica con tu centro.');
      return;
    }
    setJoinSuccess(true);
    setTimeout(() => {
      setRole('cuido');
      navigate('/caregiver');
    }, 1600);
  };

  const handleJoinBySearch = async () => {
    if (!selectedCentro) { setJoinError('Selecciona un centro.'); return; }
    setJoinError('');
    setJoinLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setJoinLoading(false);
    setJoinSuccess(true);
    setTimeout(() => {
      setRole('cuido');
      navigate('/caregiver');
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        {/* STEP 1: Formulario de registro */}
        {step === 'form' && (
          <>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
            >
              <ArrowLeft size={15} /> Volver
            </button>

            <div className="mb-7">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">
                👩‍🏫
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">Personal del Centro</h2>
              <p className="text-sm text-muted-foreground">Crea tu cuenta y únete a tu centro.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive mb-4"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-5 space-y-3.5">
              {/* Nombre */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nombre completo *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    placeholder="Elena Martínez"
                    value={form.name}
                    onChange={e => upd('name')(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Correo electrónico *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={e => upd('email')(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Contraseña *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => upd('password')(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Creando cuenta...</>
              ) : 'Continuar →'}
            </button>
          </>
        )}

        {/* STEP 2: Unirse al centro */}
        {step === 'join' && (
          <>
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
            >
              <ArrowLeft size={15} /> Volver
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-foreground mb-1">Unirse a un centro</h2>
              <p className="text-sm text-muted-foreground">Conecta tu cuenta con tu lugar de trabajo.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
              <button
                onClick={() => { setJoinMethod('code'); setJoinError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${joinMethod === 'code' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                <KeyRound size={12} className="inline mr-1.5" />
                Código
              </button>
              <button
                onClick={() => { setJoinMethod('search'); setJoinError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${joinMethod === 'search' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                <Search size={12} className="inline mr-1.5" />
                Buscar centro
              </button>
            </div>

            <AnimatePresence mode="wait">
              {joinMethod === 'code' && (
                <motion.div key="code"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Código de invitación</p>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                      <input
                        placeholder="Ej. NIDO-2024"
                        value={inviteCode}
                        onChange={e => { setInviteCode(e.target.value.toUpperCase()); setJoinError(''); }}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm font-mono tracking-widest transition-all"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Solicita este código al administrador de tu centro.</p>
                  </div>
                </motion.div>
              )}

              {joinMethod === 'search' && (
                <motion.div key="search"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                      <input
                        placeholder="Buscar por nombre o ciudad..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setJoinError(''); }}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredCentros.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCentro(c); setJoinError(''); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${selectedCentro?.id === c.id ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50 hover:bg-secondary'}`}
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{c.nombre}</p>
                            <p className="text-xs text-muted-foreground">{c.ciudad}</p>
                          </div>
                          {selectedCentro?.id === c.id && (
                            <Check size={16} className="text-primary flex-shrink-0" />
                          )}
                        </button>
                      ))}
                      {filteredCentros.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-3">No se encontraron centros.</p>
                      )}
                    </div>
                  </div>
                  {selectedCentro && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 bg-secondary border border-secondary-foreground/10 rounded-xl px-4 py-3 mb-4"
                    >
                      <ChevronRight size={13} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Se enviará una <span className="font-semibold text-foreground">solicitud de acceso</span> al administrador de <span className="font-semibold text-foreground">{selectedCentro.nombre}</span>. Recibirás confirmación por correo.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {joinError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive mb-4"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {joinError}
              </motion.div>
            )}

            {/* Success state */}
            <AnimatePresence>
              {joinSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center mb-4"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={22} className="text-primary-foreground" />
                  </div>
                  <p className="font-bold text-foreground mb-1">
                    {joinMethod === 'code' ? '¡Conectado exitosamente!' : '¡Solicitud enviada!'}
                  </p>
                  <p className="text-xs text-muted-foreground">Redirigiendo a tu panel...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!joinSuccess && (
              <button
                onClick={joinMethod === 'code' ? handleJoinByCode : handleJoinBySearch}
                disabled={joinLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {joinLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Conectando...</>
                ) : joinMethod === 'code' ? 'Unirse con código →' : 'Enviar solicitud →'}
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
