import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import BackHeader from '@/components/BackHeader';
import {
  Plus, Trash2, X, Users, Baby,
  ChevronDown, ChevronUp, Edit2, Check, Search, UserPlus
} from 'lucide-react';

// ─── Category config ─────────────────────────────────────────────
const DEFAULT_CATEGORIES = ['Bebés', 'Caminadores', 'Pre-escolar'];

function getCategoryForIndex(index: number): string {
  return DEFAULT_CATEGORIES[index] ?? `Grupo ${index + 1}`;
}

// ─── Multi-select helper ─────────────────────────────────────────
function MultiSelectList<T extends { id: number; nombre?: string; name?: string }>({
  label,
  icon: Icon,
  items,
  selected,
  onToggle,
  emptyText,
}: {
  label: string;
  icon: React.ElementType;
  items: T[];
  selected: number[];
  onToggle: (id: number) => void;
  emptyText: string;
}) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(i => {
    const name = (i as any).nombre ?? (i as any).name ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon size={11} /> {label}
        {selected.length > 0 && (
          <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded-full text-[9px] font-extrabold">
            {selected.length}
          </span>
        )}
      </label>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic px-1">{emptyText}</p>
      ) : (
        <>
          <div className="relative mb-2">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="w-full bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {filtered.map(item => {
              const name = (item as any).nombre ?? (item as any).name ?? '';
              const sub = (item as any).rol ?? (item as any).age ?? '';
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all active:scale-[0.98] text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-secondary border-border text-foreground'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-primary border-primary' : 'border-border bg-card'
                  }`}>
                    {isSelected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight truncate">{name}</p>
                    {sub && <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground italic px-1 py-1">Sin resultados</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Add Members Modal (inline add to existing aula) ─────────────
function AddMembersModal({
  aula,
  mode,
  onClose,
}: {
  aula: ReturnType<typeof useApp>['aulas'][0];
  mode: 'children' | 'cuidadores';
  onClose: () => void;
}) {
  const { children, cuidadores, aulaAsignaciones, cuidadorAulaMap, asignarNinoAula, asignarCuidadorAula } = useApp();
  const { show } = useToast();

  const currentNinos = children.filter(c => aulaAsignaciones[c.id] === aula.id).map(c => c.id);
  const currentCuids = cuidadores.filter(c => cuidadorAulaMap[c.id] === aula.id).map(c => c.id);

  const [selectedNinos, setSelectedNinos] = useState<number[]>(currentNinos);
  const [selectedCuids, setSelectedCuids] = useState<number[]>(currentCuids);

  const toggleNino = (id: number) =>
    setSelectedNinos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleCuid = (id: number) =>
    setSelectedCuids(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = () => {
    children.forEach(c => {
      if (selectedNinos.includes(c.id)) asignarNinoAula(c.id, aula.id);
      else if (aulaAsignaciones[c.id] === aula.id) asignarNinoAula(c.id, -1);
    });
    cuidadores.forEach(c => {
      if (selectedCuids.includes(c.id)) asignarCuidadorAula(c.id, aula.id);
      else if (cuidadorAulaMap[c.id] === aula.id) asignarCuidadorAula(c.id, -1);
    });
    show(`${aula.nombre} actualizada`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-card rounded-t-3xl p-6 safe-bottom max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-foreground text-lg">
            {mode === 'children' ? 'Gestionar niños' : 'Gestionar cuidadores'} — {aula.nombre}
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {mode === 'children' ? (
            <MultiSelectList
              label="Niños"
              icon={Baby}
              items={children}
              selected={selectedNinos}
              onToggle={toggleNino}
              emptyText="No hay niños registrados"
            />
          ) : (
            <MultiSelectList
              label="Cuidadores"
              icon={Users}
              items={cuidadores}
              selected={selectedCuids}
              onToggle={toggleCuid}
              emptyText="No hay cuidadores registrados"
            />
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-base shadow-elevated active:scale-[0.98] mt-5"
        >
          Guardar cambios
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Aula Card ───────────────────────────────────────────────────
function AulaCard({
  aula,
  onEdit,
  onDelete,
}: {
  aula: ReturnType<typeof useApp>['aulas'][0];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { children, cuidadores, aulaAsignaciones, cuidadorAulaMap } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [addMode, setAddMode] = useState<'children' | 'cuidadores' | null>(null);

  const ninos = children.filter(c => aulaAsignaciones[c.id] === aula.id);
  const cuids = cuidadores.filter(c => cuidadorAulaMap[c.id] === aula.id);

  const categoryColors: Record<string, string> = {
    'Bebés': 'bg-rose-100 text-rose-700',
    'Caminadores': 'bg-amber-100 text-amber-700',
    'Pre-escolar': 'bg-sky-100 text-sky-700',
  };
  const catColor = categoryColors[(aula as any).categoria ?? ''] ?? 'bg-muted text-muted-foreground';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-extrabold text-foreground text-base leading-tight">{aula.nombre}</p>
              {(aula as any).categoria && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catColor}`}>
                  {(aula as any).categoria}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ninos.length} niños · {cuids.length} cuidadores
            </p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAddMode('children')}
              title="Añadir niños"
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90"
            >
              <Baby size={13} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => setAddMode('cuidadores')}
              title="Añadir cuidadores"
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90"
            >
              <UserPlus size={13} className="text-muted-foreground" />
            </button>
            <button
              onClick={onEdit}
              title="Editar aula"
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90"
            >
              <Edit2 size={13} className="text-muted-foreground" />
            </button>
            <button
              onClick={onDelete}
              title="Eliminar aula"
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90"
            >
              <Trash2 size={13} className="text-destructive" />
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-4 py-2.5 flex items-center gap-4 bg-muted/50 border-t border-border">
          <div className="flex items-center gap-2">
            <Baby size={15} className="text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{ninos.length}</span>
            <span className="text-xs text-muted-foreground">niños</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Users size={15} className="text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{cuids.length}</span>
            <span className="text-xs text-muted-foreground">cuidadores</span>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
                {/* Cuidadores */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cuidadores</p>
                  {cuids.length === 0 ? (
                    <button
                      onClick={() => setAddMode('cuidadores')}
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Añadir cuidadores
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      {cuids.map(c => (
                        <div key={c.id} className="flex items-center gap-2.5 bg-muted rounded-xl px-3 py-2">
                          <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-xs font-bold text-foreground">
                            {c.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-foreground">{c.nombre}</p>
                            <p className="text-[10px] text-muted-foreground">{c.rol}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Niños */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Niños</p>
                  {ninos.length === 0 ? (
                    <button
                      onClick={() => setAddMode('children')}
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Añadir niños
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {ninos.map(ch => (
                        <div key={ch.id} className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1">
                          <span className="text-[11px] font-semibold text-foreground">{ch.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add members modal */}
      <AnimatePresence>
        {addMode && (
          <AddMembersModal
            aula={aula}
            mode={addMode}
            onClose={() => setAddMode(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Create / Edit Aula Modal ────────────────────────────────────
function AulaModal({
  initial,
  aulaCount,
  onSave,
  onClose,
}: {
  initial?: { nombre: string; emoji: string; color: string; categoria?: string };
  aulaCount: number;
  onSave: (data: { nombre: string; emoji: string; color: string; categoria: string }, ninos: number[], cuids: number[]) => void;
  onClose: () => void;
}) {
  const { children, cuidadores } = useApp();

  const defaultCategory = getCategoryForIndex(aulaCount);
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [categoria, setCategoria] = useState(initial?.categoria ?? defaultCategory);
  const [customCategoria, setCustomCategoria] = useState('');
  const [selectedNinos, setSelectedNinos] = useState<number[]>([]);
  const [selectedCuids, setSelectedCuids] = useState<number[]>([]);

  const isEditing = !!initial;

  const toggleNino = (id: number) =>
    setSelectedNinos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleCuid = (id: number) =>
    setSelectedCuids(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const finalCategoria = categoria === '__custom__' ? customCategoria : categoria;

  const handleSave = () => {
    if (!nombre.trim()) return;
    onSave(
      { nombre: nombre.trim(), emoji: '', color: 'hsl(var(--primary))', categoria: finalCategoria },
      selectedNinos,
      selectedCuids,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-card rounded-t-3xl p-6 safe-bottom max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-foreground text-lg">
            {isEditing ? 'Editar aula' : 'Nueva aula'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Nombre del aula *</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Bebés, Caminadores, Pre-escolar..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Categoría</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEFAULT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    categoria === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategoria('__custom__')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  categoria === '__custom__'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-muted-foreground border-border'
                }`}
              >
                + Otra
              </button>
            </div>
            {categoria === '__custom__' && (
              <input
                value={customCategoria}
                onChange={e => setCustomCategoria(e.target.value)}
                placeholder="Nombre de categoría personalizada"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            )}
          </div>

          {/* Children — only for new aulas */}
          {!isEditing && (
            <MultiSelectList
              label="Niños"
              icon={Baby}
              items={children}
              selected={selectedNinos}
              onToggle={toggleNino}
              emptyText="No hay niños registrados aún"
            />
          )}

          {/* Caregivers — only for new aulas */}
          {!isEditing && (
            <MultiSelectList
              label="Cuidadores"
              icon={Users}
              items={cuidadores}
              selected={selectedCuids}
              onToggle={toggleCuid}
              emptyText="No hay cuidadores registrados aún"
            />
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!nombre.trim() || (categoria === '__custom__' && !customCategoria.trim())}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-base shadow-elevated active:scale-[0.98] disabled:opacity-40 mt-5"
        >
          {isEditing ? 'Guardar cambios' : 'Crear aula'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function Aulas() {
  const {
    aulas, children, cuidadores, aulaAsignaciones,
    addAula, updateAula, removeAula, asignarNinoAula, asignarCuidadorAula,
  } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof aulas[0] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<typeof aulas[0] | null>(null);

  const sinAula = children.filter(c => !aulaAsignaciones[c.id]).length;

  const handleCreate = (
    data: { nombre: string; emoji: string; color: string; categoria: string },
    ninoIds: number[],
    cuidIds: number[],
  ) => {
    const newId = Date.now();
    // addAula injects the id internally; we then assign members by using the context directly
    addAula(data as any);
    // We use a small timeout so the aula is in state before we assign
    setTimeout(() => {
      ninoIds.forEach(id => asignarNinoAula(id, newId));
      cuidIds.forEach(id => asignarCuidadorAula(id, newId));
    }, 0);
    setShowModal(false);
    show('Aula creada');
  };

  const handleEdit = (data: { nombre: string; emoji: string; color: string; categoria: string }) => {
    if (!editTarget) return;
    updateAula(editTarget.id, data as any);
    setEditTarget(null);
    show('Aula actualizada');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Aulas" onBack={() => navigate('/configuracion')} />

      {/* Summary bar */}
      <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-2.5">
        {[
          { label: 'Aulas', value: aulas.length },
          { label: 'Niños', value: children.length },
          { label: 'Sin aula', value: sinAula, alert: sinAula > 0 },
        ].map(s => (
          <div
            key={s.label}
            className={`bg-card rounded-2xl p-3 text-center shadow-card border ${
              s.alert ? 'border-destructive/30' : 'border-transparent'
            }`}
          >
            <div className={`text-xl font-extrabold ${s.alert ? 'text-destructive' : 'text-foreground'}`}>
              {s.value}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Aulas list */}
      <div className="px-4 pt-3 space-y-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] shadow-card"
        >
          <Plus size={16} /> Nueva aula
        </button>

        {aulas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-bold text-foreground">Sin aulas registradas</p>
            <p className="text-sm mt-1">Crea la primera aula para organizar tu cuido.</p>
          </div>
        ) : (
          aulas.map(aula => (
            <AulaCard
              key={aula.id}
              aula={aula}
              onEdit={() => setEditTarget(aula)}
              onDelete={() => setDeleteTarget(aula)}
            />
          ))
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <AulaModal
            aulaCount={aulas.length}
            onSave={handleCreate}
            onClose={() => setShowModal(false)}
          />
        )}
        {editTarget && (
          <AulaModal
            initial={editTarget as any}
            aulaCount={aulas.length}
            onSave={(data) => handleEdit(data)}
            onClose={() => setEditTarget(null)}
          />
        )}
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center px-6"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-float"
            >
              <div className="text-center mb-5">
                <h3 className="font-extrabold text-foreground text-lg">¿Eliminar {deleteTarget.nombre}?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Los niños y cuidadores asignados quedarán sin aula.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-secondary text-foreground font-bold py-3.5 rounded-2xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    removeAula(deleteTarget.id);
                    setDeleteTarget(null);
                    show('Aula eliminada');
                  }}
                  className="flex-1 bg-destructive text-destructive-foreground font-bold py-3.5 rounded-2xl text-sm"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
