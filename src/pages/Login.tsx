import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, ChevronRight, ArrowLeft, Building2, Users, UserCheck, Heart } from 'lucide-react';

const MOCK_USERS = [
  { email: 'admin@rayito.com',  role: 'admin'     },
  { email: 'elena@rayito.com',  role: 'caregiver' },
  { email: 'carlos@rayito.com', role: 'caregiver' },
  { email: 'juan@gmail.com',    role: 'parent'    },
];

const ROLE_DEST: Record<string, string> = {
  admin:     '/dashboard',
  caregiver: '/caregiver',
  parent:    '/parent-onboarding',
};

type Screen = 'home' | 'login' | 'register' | 'join';

const slideVariants = {
  enter:  { x: '100%', opacity: 0 },
  center: { x: 0,      opacity: 1 },
  exit:   { x: '-60%', opacity: 0 },
};

const transition = { type: 'spring' as const, stiffness: 340, damping: 36 };

export default function Login() {
  const { login, loading } = useSupabase();
  const { setRole } = useApp();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>('home');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const DEMOS = [
    { label: 'Admin',     sub: 'Panel completo · María López',  email: 'admin@rayito.com'  },
    { label: 'Cuidadora', sub: 'Registra actividades · Elena',  email: 'elena@rayito.com'  },
    { label: 'Cuidador',  sub: 'Registra actividades · Carlos', email: 'carlos@rayito.com' },
  ];

  const redirectByEmail = (emailVal: string) => {
    const user = MOCK_USERS.find(u => u.email === emailVal);
    const role = user?.role || 'admin';
    setRole(role === 'parent' ? 'parent' : 'cuido');
    navigate(ROLE_DEST[role] || '/dashboard');
  };

  const handleLogin = async () => {
    if (!email.trim()) { setError('Ingresa tu correo.'); return; }
    const { error: err } = await login(email, password);
    if (err) { setError(err); return; }
    redirectByEmail(email);
  };

  const handleDemo = async (emailVal: string) => {
    const { error: err } = await login(emailVal, 'demo');
    if (!err) redirectByEmail(emailVal);
  };

  const go = (s: Screen) => { setError(''); setScreen(s); };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <div className="w-full max-w-sm relative">
        <AnimatePresence mode="wait" initial={false}>

          {/* HOME */}
          {screen === 'home' && (
            <motion.div key="home"
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={transition}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-sm">
                🐣
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">NidoApp</h1>
              <p className="text-sm text-muted-foreground mb-10 text-center">La app para cuidados infantiles</p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => go('register')}
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Inscribirse
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => go('login')}
                  className="w-full bg-card border border-border text-foreground font-bold py-4 rounded-2xl text-sm shadow-sm hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all"
                >
                  Iniciar sesión
                </button>
              </div>

              <p className="text-muted-foreground/50 text-xs mt-8 text-center">
                Gestión de centros infantiles · República Dominicana
              </p>
            </motion.div>
          )}

          {/* LOGIN */}
          {screen === 'login' && (
            <motion.div key="login"
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={transition}
            >
              <button
                onClick={() => go('home')}
                className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
              >
                <ArrowLeft size={15} /> Volver
              </button>

              <div className="mb-7">
                <h2 className="text-2xl font-extrabold text-foreground mb-1">Iniciar sesión</h2>
                <p className="text-sm text-muted-foreground">Ingresa con tu cuenta existente.</p>
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

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="email" placeholder="tu@correo.com" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="password" placeholder="••••••••" value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogin} disabled={loading}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? 'Entrando...' : 'Entrar →'}
              </button>

              <div className="mt-5">
                <p className="text-muted-foreground/50 text-[10px] text-center mb-3 font-bold uppercase tracking-wider">Acceso rápido demo</p>
                <div className="space-y-2">
                  {DEMOS.map(d => (
                    <button
                      key={d.email} onClick={() => handleDemo(d.email)} disabled={loading}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      <div>
                        <span className="text-foreground font-semibold text-sm block">{d.label}</span>
                        <span className="text-muted-foreground text-xs">{d.sub}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </button>
                  ))}
                  <button
                    onClick={() => handleDemo('juan@gmail.com')} disabled={loading}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    <div>
                      <span className="text-foreground font-semibold text-sm block">Padre demo</span>
                      <span className="text-muted-foreground text-xs">Vista de padre · Juan</span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* INSCRIBIRSE: elegir tipo */}
          {screen === 'register' && (
            <motion.div key="register"
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={transition}
            >
              <button
                onClick={() => go('home')}
                className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
              >
                <ArrowLeft size={15} /> Volver
              </button>

              <div className="mb-7">
                <h2 className="text-2xl font-extrabold text-foreground mb-1">Inscribirse</h2>
                <p className="text-sm text-muted-foreground">¿Cómo deseas usar NidoApp?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/register-daycare')}
                  className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-start gap-4 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={22} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base mb-0.5">Crear un centro</p>
                    <p className="text-xs text-muted-foreground mb-2.5">Registrar una escuela, cuido o sala</p>
                    <div className="bg-primary/8 border border-primary/15 rounded-xl px-3 py-2">
                      <p className="text-xs text-primary font-semibold leading-relaxed">
                        Comience una prueba gratuita para gestionar las operaciones de su centro
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground mt-1 flex-shrink-0" />
                </button>

                <button
                  onClick={() => go('join')}
                  className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users size={22} className="text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-base mb-0.5">Conectarse a un centro</p>
                    <p className="text-xs text-muted-foreground">Si eres padre/tutor o empleado de un centro</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* CONECTARSE: personal o familiar */}
          {screen === 'join' && (
            <motion.div key="join"
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={transition}
            >
              <button
                onClick={() => go('register')}
                className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
              >
                <ArrowLeft size={15} /> Volver
              </button>

              <div className="mb-7">
                <h2 className="text-2xl font-extrabold text-foreground mb-1">Conectarse a un centro</h2>
                <p className="text-sm text-muted-foreground">¿Cuál es tu relación con el centro?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/register-caregiver')}
                  className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <UserCheck size={22} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-base mb-0.5">Personal del Centro</p>
                    <p className="text-xs text-muted-foreground">Para cuidadores, profesores y empleados</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/register-parent')}
                  className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all"
                >
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart size={22} className="text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-base mb-0.5">Familiares y autorizados</p>
                    <p className="text-xs text-muted-foreground">Para padres o tutores</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
