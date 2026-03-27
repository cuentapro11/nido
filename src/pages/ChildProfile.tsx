import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import ChildAvatar from '@/components/ChildAvatar';
import ActivityModal from '@/components/ActivityModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Palette, Download, Info, Heart, FileText, ArrowLeft, CreditCard, Lock, User, Pill, Users, ImageIcon, Calendar, ListFilter, ChevronDown, Image, MessageSquare, X } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import ActivityIcon from '@/components/ActivityIcon';

export default function ChildProfile() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { children, role, updateChild } = useApp();
  const [showFab, setShowFab] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showExpediente, setShowExpediente] = useState(false);
  const { profile } = useSupabase();

  const isAdmin = profile?.role === 'admin';
  const isCuido = role === 'cuido';
  const canLogActivity = isAdmin || isCuido;
  const isParent = role === 'parent';
  const [likedItems, setLikedItems] = useState({});

  // Full-screen image viewer
  const [fullScreenImg, setFullScreenImg] = useState(null);

  // Filtros
  const [dayFilter, setDayFilter] = useState('Últimos 30 días');
  const [showDayDrop, setShowDayDrop] = useState(false);
  const [typeFilter, setTypeFilter] = useState('todo');
  const [showTypeDrop, setShowTypeDrop] = useState(false);

  const cid = Number(childId);
  const child = children.find(c => c.id === cid);
  if (!child) return null;

  const smartDateLabel = () => {
    const now = new Date();
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
  };

  const filteredTl = child.tl.filter(item => typeFilter === 'todo' || item.type === typeFilter);

  const InfoField = ({ label, value, field }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const canEdit = isParent;
    const save = () => {
      if (field === 'alerts') {
        updateChild(child.id, { alerts: draft ? draft.split(',').map(s => s.trim()) : [] });
      } else {
        updateChild(child.id, { [field]: draft });
      }
      setEditing(false);
    };
    return (
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
        <span className="text-sm font-semibold text-foreground min-w-[110px]">{label}</span>
        {canEdit ? (
          editing ? (
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={e => e.key === 'Enter' && save()}
              autoFocus
              className="flex-1 text-right text-sm text-foreground bg-secondary border-b-2 border-primary outline-none px-2 py-0.5 ml-3"
            />
          ) : (
            <button onClick={() => { setDraft(field === 'alerts' ? child.alerts.join(', ') : value); setEditing(true); }}
              className="flex-1 text-right text-sm text-muted-foreground active:opacity-60 ml-3">
              {value || <span className="text-muted-foreground/40">Añadir</span>}
            </button>
          )
        ) : (
          <span className="flex-1 text-right text-sm text-muted-foreground ml-3">
            {value || <span className="text-muted-foreground/40">—</span>}
          </span>
        )}
      </div>
    );
  };

  const actions = [
    ...(canLogActivity ? [{ icon: <Palette size={19} className="text-white" />, label: 'Actividad', fn: () => setShowFab(true), gradient: 'from-[hsl(240,60%,62%)] to-[hsl(240,70%,52%)]' }] : []),
    { icon: <Phone size={19} className="text-white" />, label: 'Llamar', fn: () => setShowPhone(true), gradient: 'from-[hsl(152,55%,45%)] to-[hsl(158,60%,38%)]' },
    { icon: <Info size={19} className="text-white" />, label: 'Información', fn: () => setShowInfo(true), gradient: 'from-[hsl(35,80%,55%)] to-[hsl(28,85%,48%)]' },
  ];

  const ExpedienteScreen = () => (
    <AnimatePresence>
      {showExpediente && (
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          className="fixed inset-0 z-50 bg-background overflow-y-auto pb-10"
        >
          <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border bg-background sticky top-0 z-10">
            <button onClick={() => setShowExpediente(false)}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90 transition-transform">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2.5 flex-1">
              <ChildAvatar child={child} size={36} />
              <div>
                <h1 className="text-base font-extrabold text-foreground leading-tight">Expediente</h1>
                <p className="text-[11px] text-muted-foreground">{child.name}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase tracking-wider">Admin</span>
          </div>

          <div className="px-4 pt-5 space-y-5">
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <User size={14} className="text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Datos generales</span>
              </div>
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <InfoField label="Nombre completo" value={child.name} field="name" />
                <InfoField label="Edad" value={child.age} field="age" />
                <InfoField label="Grupo" value={child.group} field="group" />
                <InfoField label="Cumpleaños" value={child.cumpleanos || '—'} field="cumpleanos" />
                <InfoField label="Fecha de ingreso" value={child.fechaIngreso || '—'} field="fechaIngreso" />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <Pill size={14} className="text-destructive" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Salud</span>
              </div>
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <InfoField label="Medicamentos" value={child.medicamentos || '—'} field="medicamentos" />
                <InfoField label="Alergias" value={child.alerts.join(', ')} field="alerts" />
                <InfoField label="Notas médicas" value={child.notas || '—'} field="notas" />
              </div>
            </section>

            {child.contactos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <Users size={14} className="text-success" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contactos</span>
                </div>
                <div className="space-y-2">
                  {child.contactos.map((ct, i) => (
                    <div key={i} className="bg-card rounded-2xl px-4 py-3.5 shadow-card flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: child.bg }}>{child.emoji}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{ct.nombre}</div>
                        <div className="text-xs text-muted-foreground">{ct.relacion} · {ct.telefono}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <Lock size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notas privadas</span>
              </div>
              <div className="bg-card rounded-2xl shadow-card px-4 py-3.5">
                <p className="text-sm text-muted-foreground leading-relaxed">{child.notasPrivadas || 'Sin notas privadas.'}</p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <CreditCard size={14} className="text-purple-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Historial de pagos</span>
              </div>
              <div className="space-y-1.5">
                {child.historialPagos?.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-success/10 rounded-xl px-3.5 py-2.5">
                    <span className="text-success font-bold text-xs">✓</span>
                    <span className="text-sm text-success font-semibold">{p}</span>
                  </div>
                )) || <p className="text-sm text-muted-foreground px-1">Sin registros.</p>}
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-background pb-6">

      {/* ── VISOR DE IMAGEN FULL SCREEN ── */}
      <AnimatePresence>
        {fullScreenImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setFullScreenImg(null)}
          >
            <button className="absolute top-12 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
              <X size={24} />
            </button>
            <img src={fullScreenImg} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Navegación */}
      <div className="flex items-center justify-between px-4 pt-8 pb-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${child.present ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-base font-bold text-foreground">{child.name}</span>
        </div>
        {isAdmin ? (
          <button onClick={() => setShowExpediente(true)} className="text-sm font-bold text-primary active:opacity-70">Expediente</button>
        ) : <div className="w-16" />}
      </div>

      {/* Perfil Niño */}
      <div className="flex flex-col items-center py-5 bg-card">
        <ChildAvatar child={child} size={88} className="border-[3px] border-border shadow-soft" />
        <p className="text-xs text-muted-foreground mt-2">{child.age} · {child.group}</p>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex border-b border-border bg-card py-3.5 px-2">
        {actions.map(a => (
          <button key={a.label} onClick={a.fn} className="flex-1 flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-soft`}>{a.icon}</div>
            <span className="text-[10px] font-bold text-muted-foreground leading-tight text-center">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Filtros de Timeline */}
      <div className="bg-background">
        <div className="flex gap-2.5 px-4 py-3">
          <div className="relative flex-1">
            <button onClick={() => { setShowDayDrop(!showDayDrop); setShowTypeDrop(false); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold shadow-soft">
              <span className="flex items-center gap-1.5 truncate"><Calendar size={13} className="text-primary" />{dayFilter}</span>
              <ChevronDown size={13} className={showDayDrop ? 'rotate-180' : ''} />
            </button>
            {showDayDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden">
                {['Hoy', 'Últimos 7 días', 'Últimos 30 días', 'Todo'].map(d => (
                  <button key={d} onClick={() => { setDayFilter(d); setShowDayDrop(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs ${dayFilter === d ? 'bg-primary/10 text-primary' : ''}`}>{d}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button onClick={() => { setShowTypeDrop(!showTypeDrop); setShowDayDrop(false); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold shadow-soft">
              <span className="flex items-center gap-1.5 truncate"><ListFilter size={13} className="text-primary" />{typeFilter === 'todo' ? 'Todo' : typeFilter}</span>
              <ChevronDown size={13} className={showTypeDrop ? 'rotate-180' : ''} />
            </button>
            {showTypeDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden">
                {['todo', 'foto', 'nota', 'comida', 'sueño', 'actividad', 'salud'].map(f => (
                  <button key={f} onClick={() => { setTypeFilter(f); setShowTypeDrop(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs ${typeFilter === f ? 'bg-primary/10 text-primary' : ''}`}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">{smartDateLabel()}</span>
        </div>

        {/* FEED DE ACTIVIDADES (Con la alineación arreglada) */}
        <div className="px-3.5 pb-8">
          {filteredTl.map((item, i) => (
            <motion.div key={i}>
              {i > 0 && (
                <div className="flex items-center gap-2 my-2 px-1">
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
            <div className="bg-card rounded-2xl overflow-hidden shadow-card">
              
              {item.hasImg ? (
                /* --- TARJETA FOTO --- */
                <div className="flex items-stretch">
                  {/* Columna izquierda con eje central alineado a 48px global */}
                  <div className="w-[76px] flex flex-col items-center py-4 flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center mb-4">
                      <ActivityIcon type={item.type} size={36} iconSize={16} />
                    </div>
                    <div className="flex flex-col gap-5">
                      <button onClick={() => setLikedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform">
                        <Heart size={22} className={likedItems[i] ? 'text-destructive fill-destructive' : 'text-muted-foreground'} strokeWidth={1.5} />
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform">
                        <Download size={22} className="text-muted-foreground" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  {/* Imagen clickable */}
                  <div onClick={() => setFullScreenImg(item.photo)} className="flex-1 aspect-square bg-muted cursor-pointer active:opacity-90 transition-opacity">
                    <img src={item.photo} alt="Activity" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                /* --- TARJETA NORMAL --- */
                <div className="flex items-center p-4">
                  <div className="w-[48px] flex-shrink-0 flex justify-center">
                    <ActivityIcon type={item.type} size={48} iconSize={22} />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="text-sm font-bold text-foreground">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground">{item.time}</div>
                  </div>
                  <button onClick={() => setLikedItems(prev => ({ ...prev, [i]: !prev[i] }))}>
                    <Heart size={20} className={likedItems[i] ? 'text-destructive fill-destructive' : 'text-muted-foreground'} strokeWidth={1.5} />
                  </button>
                </div>
              )}

              {/* Información común debajo */}
              {(item.desc || item.hasImg) && (
                <div className="px-4 pb-4">
                  {item.hasImg && <div className="text-[11px] text-muted-foreground mb-1 pt-2">{item.time}</div>}
                  {item.desc && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>}
                </div>
              )}
            </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modales Inferiores */}
      <BottomSheet open={showPhone} onClose={() => setShowPhone(false)}>
        <div className="p-4"><h3 className="text-lg font-extrabold mb-4 text-foreground">Contactos de {child.name}</h3>
        {child.contactos.map((ct, i) => (
          <div key={i} className="flex items-center gap-3 mb-2 bg-muted p-3.5 rounded-xl">
            <div className="flex-1"><p className="text-sm font-bold">{ct.nombre}</p><p className="text-xs text-muted-foreground">{ct.relacion} · {ct.telefono}</p></div>
            <a href={`tel:${ct.telefono}`} className="bg-success text-white px-4 py-2 rounded-full text-xs font-bold shadow-soft">Llamar</a>
          </div>
        ))}</div>
      </BottomSheet>

      <BottomSheet open={showInfo} onClose={() => setShowInfo(false)}>
        <div className="p-4 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white"><Info size={20}/></div>
          <h3 className="text-lg font-extrabold">Información rápida</h3>
        </div>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mx-4 mb-6">
          <InfoField label="Nombre" value={child.name} field="name" />
          <InfoField label="Notas" value={child.notas || ''} field="notas" />
          <InfoField label="Alergias" value={child.alerts.join(', ')} field="alerts" />
        </div>
      </BottomSheet>

      <ActivityModal open={showFab} onClose={() => setShowFab(false)} preselectedChildId={cid} />
      <ExpedienteScreen />
    </div>
  );
}
