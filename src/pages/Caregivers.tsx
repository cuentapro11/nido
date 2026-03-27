import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { motion } from 'framer-motion';
import { UserPlus, X, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BackHeader from '@/components/BackHeader';
import BottomNav from '@/components/BottomNav';

const ROLE_COLOR: Record<string, string> = {
  admin:     'bg-primary/10 text-primary',
  caregiver: 'bg-[hsl(var(--info)/0.12)] text-info',
  parent:    'bg-accent/10 text-accent',
};
const ROLE_LABEL: Record<string, string> = { admin: 'Admin', caregiver: 'Cuidador', parent: 'Padre' };

const SALAS = ['Bebés', 'Caminadores', 'Pre-escolar'] as const;

export default function Caregivers() {
  const { profile, daycare, getCaregivers, createCaregiver, loading } = useSupabase();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', sala: 'Bebés' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [, tick] = useState(0);
  const upd = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  // Sala assignments stored locally
  const [salaAssignments, setSalaAssignments] = useState<Record<string, string>>({});
  const [showSalaDrop, setShowSalaDrop] = useState<string | null>(null);

  const caregivers = getCaregivers();

  const submit = async () => {
    if (!form.name || (!form.phone && !form.email)) { setError('Nombre y contacto son requeridos.'); return; }
    const { error: err } = await createCaregiver(form);
    if (err) { setError(err); return; }
    // Save sala assignment
    setSalaAssignments(prev => ({ ...prev, [form.name]: form.sala }));
    setForm({ name: '', phone: '', email: '', password: '', sala: 'Bebés' });
    setOk(true); tick(n => n + 1);
    setTimeout(() => { setOk(false); setShowForm(false); }, 2200);
  };

  const changeSala = (cgName: string, sala: string) => {
    setSalaAssignments(prev => ({ ...prev, [cgName]: sala }));
    setShowSalaDrop(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <BackHeader title="Cuidadores" onBack={() => navigate('/dashboard')} />
      <PageHeader
        title="Cuidadores"
        subtitle={daycare?.name}
        right={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform">
            <UserPlus size={14} /> Agregar
          </button>
        }
      />

      <div className="px-4">
        {/* Info banner */}
        <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-medium mb-4">
          El cuidador entra por <strong>"Soy del Cuido"</strong> con el correo y contraseña que le asignes aquí.
        </div>

        {/* Add form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-card mb-4 border-l-4 border-info">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-extrabold text-foreground">Nuevo cuidador</span>
              <button onClick={() => { setShowForm(false); setError(''); }} className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>

            {error && <div className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-xs font-bold mb-3">{error}</div>}
            {ok    && <div className="bg-success-light text-success rounded-xl px-3 py-2 text-xs font-bold mb-3">✓ Cuidador creado. Ya puede entrar por "Soy del Cuido".</div>}

            <div className="space-y-2.5">
              <input placeholder="Nombre completo *" value={form.name} onChange={e => upd('name')(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
              <input placeholder="Teléfono" value={form.phone} onChange={e => upd('phone')(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
              <input type="email" placeholder="Correo electrónico" value={form.email} onChange={e => upd('email')(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
              <input type="password" placeholder="Contraseña temporal (mín. 6 caracteres)" value={form.password} onChange={e => upd('password')(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" />
              
              {/* Sala selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sala asignada</label>
                <div className="flex gap-2">
                  {SALAS.map(sala => (
                    <button
                      key={sala}
                      onClick={() => setForm(p => ({ ...p, sala }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        form.sala === sala
                          ? 'bg-primary text-primary-foreground shadow-soft'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {sala}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Comparte estas credenciales al cuidador para que pueda acceder.</p>
            <button onClick={submit} disabled={loading} className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm mt-3 shadow-elevated active:scale-[0.98] transition-transform disabled:opacity-60">
              {loading ? 'Creando...' : 'Crear cuidador'}
            </button>
          </motion.div>
        )}

        {/* Admin card */}
        <div className="bg-card rounded-2xl p-3.5 shadow-card mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0">
              {(profile?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground text-sm">{profile?.name} <span className="text-muted-foreground text-xs">(tú)</span></div>
              <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
            </div>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">Admin</span>
          </div>
        </div>

        {/* Caregiver cards with sala assignment */}
        <div className="space-y-2.5 mb-6">
          {caregivers.map((cg, i) => {
            const currentSala = salaAssignments[cg.name] || 'Bebés';
            return (
              <motion.div key={cg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-3.5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-info/10 flex items-center justify-center text-sm font-extrabold text-info flex-shrink-0">
                    {cg.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm">{cg.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{cg.email || cg.phone}</div>
                  </div>
                  <span className="bg-info/10 text-info text-[10px] font-bold px-2.5 py-1 rounded-full">Cuidador</span>
                </div>
                {/* Sala assignment */}
                <div className="mt-2.5 pt-2.5 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Sala asignada:</span>
                    <div className="relative">
                      <button
                        onClick={() => setShowSalaDrop(showSalaDrop === cg.name ? null : cg.name)}
                        className="flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-transform"
                      >
                        {currentSala}
                        <ChevronDown size={10} className={`transition-transform ${showSalaDrop === cg.name ? 'rotate-180' : ''}`} />
                      </button>
                      {showSalaDrop === cg.name && (
                        <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden min-w-[130px]">
                          {SALAS.map(sala => (
                            <button key={sala} onClick={() => changeSala(cg.name, sala)}
                              className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors ${
                                currentSala === sala ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                              }`}>
                              {sala}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Roles info */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <p className="text-sm font-extrabold text-foreground mb-3">Roles y permisos</p>
          {[['admin', 'Control total del cuido'], ['caregiver', 'Registra actividades y ve niños'], ['parent', 'Solo lectura de su hijo']].map(([role, desc]) => (
            <div key={role} className="flex items-center gap-2.5 mb-2.5">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ROLE_COLOR[role]}`}>{ROLE_LABEL[role]}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
