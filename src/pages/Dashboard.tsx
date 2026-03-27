import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import FABButton from '@/components/FABButton';
import PageHeader from '@/components/PageHeader';
import ChildAvatar from '@/components/ChildAvatar';
import ActivityModal from '@/components/ActivityModal';
import { useState } from 'react';

export default function Dashboard() {
  const { children } = useApp();
  const navigate = useNavigate();
  const [showFab, setShowFab] = useState(false);

  const presentes = children.filter(c => c.present);
  const ausentes = children.filter(c => !c.present);

  const isWarn = (c: typeof children[0]) => c.present && (c.lastMin === null || c.lastMin <= -60);
  const lastLabel = (c: typeof children[0]) => {
    if (!c.present || c.lastMin === null) return '';
    if (c.lastMin === 0) return 'Ahora mismo';
    return 'Hace ' + Math.abs(c.lastMin) + ' min';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Panel"
        subtitle="Cuido Rayito de Sol ☀️"
      />

      {/* Metrics */}
      <div className="flex gap-2 px-4 pb-4">
        {[
          { num: presentes.length, label: 'Presentes', color: 'text-success' },
          { num: ausentes.length, label: 'Ausentes', color: 'text-destructive' },
          { num: children.length, label: 'Total', color: 'text-primary' },
        ].map(m => (
          <div key={m.label} className="flex-1 bg-card rounded-xl p-3 text-center shadow-card">
            <div className={`text-xl font-extrabold ${m.color}`}>{m.num}</div>
            <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Children list */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-foreground">Con entrada hoy</span>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5">
          {presentes.length} niños
        </span>
      </div>

      <div className="px-3.5 space-y-2.5">
        {presentes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-3xl mb-2">🌅</div>
            <div className="text-sm font-bold text-foreground">Todo tranquilo</div>
            <div className="text-xs mt-1">Nadie ha llegado aún.</div>
          </div>
        )}
        {presentes.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => { navigate(`/child/${c.id}`); }}
              className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left"
            >
              <ChildAvatar child={c} size={50} showStatus />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground flex items-center gap-1">
                  {c.name}
                  {c.alerts.length > 0 && (
                    <span className="bg-destructive/10 text-destructive rounded-md px-1.5 py-px text-[10px] font-bold">⚠</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.age} · {c.group}</div>
                {c.lastMin !== null && (
                  <div className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 ${isWarn(c) ? 'bg-warning-light' : 'bg-success-light'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isWarn(c) ? 'bg-warning' : 'bg-success'}`} />
                    <span className={`text-[10px] font-bold ${isWarn(c) ? 'text-warning-foreground' : 'text-success'}`}>
                      {lastLabel(c)}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                  <path d="M1.5 1.5L6.5 6.5L1.5 11.5" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <FABButton onClick={() => setShowFab(true)} />
      <BottomNav />
      <ActivityModal open={showFab} onClose={() => setShowFab(false)} />
    </div>
  );
}
