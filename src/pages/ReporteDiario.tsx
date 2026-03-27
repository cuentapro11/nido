import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackHeader from '@/components/BackHeader';
import { X, Search, Calendar, Filter } from 'lucide-react';

function formatDate(d: string) {
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' });
}

const TODAY = new Date().toISOString().split('T')[0];

const CATEGORIES = ['Todas', 'Bebés', 'Caminadores', 'Pre-escolar'];

const CATEGORY_TO_GROUPS: Record<string, string[]> = {
  'Bebés': ['Bebés'],
  'Caminadores': ['Caminadores'],
  'Pre-escolar': ['Pre-escolar'],
};

// ─── Activity Card ────────────────────────────────────────────────
function ActivityCard({
  item,
  childName,
}: {
  item: { icon: string; title: string; desc: string; time: string; type: string };
  childName: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-3.5 shadow-card">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground text-sm">{item.title}</div>
          {item.desc && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {childName}
            </span>
            <span className="text-[10px] text-muted-foreground">{item.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Segmented Control ───────────────────────────────────────────
function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex bg-muted rounded-xl p-1 border border-border overflow-x-auto gap-0.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 whitespace-nowrap py-1.5 px-3 rounded-lg text-xs font-bold transition-all min-w-0 ${
            value === opt
              ? 'bg-card text-primary shadow-soft'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ReporteDiario() {
  const { children, aulas, aulaAsignaciones } = useApp();
  const navigate = useNavigate();

  // Filters
  const [filterDate, setFilterDate] = useState(TODAY);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [searchChild, setSearchChild] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Derive selected child from search (if exact match or first match)
  const matchedChild = useMemo(() => {
    const q = searchChild.trim().toLowerCase();
    if (!q) return null;
    return children.find(c => c.name.toLowerCase().includes(q)) ?? null;
  }, [searchChild, children]);

  // Get all activities
  const allActivities = useMemo(() => {
    return children.flatMap(c =>
      c.tl.map(item => ({
        ...item,
        childId: c.id,
        childName: c.name,
        group: c.group,
      }))
    );
  }, [children]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    let result = allActivities;

    // Filter by category (maps to child groups)
    if (filterCategory !== 'Todas') {
      const groups = CATEGORY_TO_GROUPS[filterCategory] ?? [filterCategory];
      result = result.filter(a => groups.includes(a.group));
    }

    // Filter by searched child
    if (searchChild.trim()) {
      const q = searchChild.trim().toLowerCase();
      result = result.filter(a => a.childName.toLowerCase().includes(q));
    }

    return result;
  }, [allActivities, filterCategory, searchChild]);

  const hasActiveFilters = filterCategory !== 'Todas' || searchChild.trim() !== '';

  const clearAll = () => {
    setFilterCategory('Todas');
    setSearchChild('');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Reporte Diario" onBack={() => navigate('/configuracion')} />

      {/* Filter panel */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-card">

          {/* Top row: date + toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-primary" />
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="text-sm font-bold text-foreground bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-bold">
                {filteredActivities.length} registros
              </span>
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-3 border-t border-border space-y-4">

                  {/* Category filter — segmented control */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Categoría
                    </label>
                    <SegmentedControl
                      options={CATEGORIES}
                      value={filterCategory}
                      onChange={setFilterCategory}
                    />
                  </div>

                  {/* Child search — clean input only */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                      Niño
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={searchChild}
                        onChange={e => setSearchChild(e.target.value)}
                        placeholder="Buscar niño..."
                        className="w-full bg-muted border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                      />
                      {searchChild && (
                        <button
                          onClick={() => setSearchChild('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
          {filterCategory !== 'Todas' && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              {filterCategory}
              <button onClick={() => setFilterCategory('Todas')} className="hover:text-primary/70">
                <X size={12} />
              </button>
            </span>
          )}
          {searchChild.trim() && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              Niño: {searchChild.trim()}
              <button onClick={() => setSearchChild('')} className="hover:text-primary/70">
                <X size={12} />
              </button>
            </span>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground font-semibold hover:text-foreground ml-1"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Activity list */}
      <div className="px-4 space-y-2.5">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-bold text-foreground">Sin actividades registradas</p>
            <p className="text-sm text-muted-foreground mt-1">
              Las actividades aparecerán aquí cuando se registren.
            </p>
          </div>
        ) : (
          filteredActivities.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <ActivityCard item={item} childName={item.childName} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
