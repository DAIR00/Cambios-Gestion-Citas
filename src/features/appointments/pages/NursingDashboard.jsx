import { useEffect, useState, useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { useAuth } from "../../../providers/AuthProvider";
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, XCircle, User, History, Stethoscope, Thermometer, Heart, Activity, List } from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";
import { SearchSidebar } from "../../../shared/components/SearchSidebar";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EmptyState } from "../../../shared/components/EmptyState";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ATTENTION_TYPES = [
  { value: "control", label: "Control" },
  { value: "urgency", label: "Urgencia" },
  { value: "routine", label: "Control Rutinario" },
  { value: "vaccination", label: "Vacunación" },
];

const FILTERS = [
  { value: "", label: "Todas", Icon: List },
  { value: "pending", label: "Pendientes", Icon: AlertCircle },
  { value: "confirmed", label: "Confirmadas", Icon: Clock },
  { value: "completed", label: "Historial", Icon: CheckCircle },
];

export default function NursingDashboard() {
  const { appointments, fetchMyAppointments, fetchApprenticeHistory, updateAppointment, updateStatus, isLoading, searchFilters, updateSearchFilters, clearSearchFilters, fetchWithSearch } = useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchSidebarOpen, setSearchSidebarOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [attentionType, setAttentionType] = useState("control");
  const [vitals, setVitals] = useState({ temperature: "", blood_pressure: "", heart_rate: "", weight: "" });
  const [historyModal, setHistoryModal] = useState(null);
  const [apprenticeHistory, setApprenticeHistory] = useState([]);

  useEffect(() => { fetchMyAppointments({ status: filter }); }, [filter, profile, fetchMyAppointments]);

  const handleSearch = () => {
    fetchWithSearch({ status: filter });
  };

  const handleFilterChange = (newFilters) => {
    updateSearchFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearSearchFilters();
    fetchMyAppointments({ status: filter });
  };

  const stats = useMemo(() => ({
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  }), [appointments]);

  const completionRate = appointments.length > 0 ? Math.round((stats.completed / appointments.length) * 100) : 0;

  const handleConfirm = async (id) => { await updateStatus(id, "confirmed"); fetchMyAppointments({ status: filter }); };
  const handleShow = async (id) => { await updateStatus(id, "no_show"); fetchMyAppointments({ status: filter }); };

  const handleComplete = async (id) => {
    if (!notes.trim()) return;
    await updateAppointment(id, { status: "completed", notes, attention_type: attentionType, ...vitals });
    setNotes(""); setVitals({ temperature: "", blood_pressure: "", heart_rate: "", weight: "" }); setAttentionType("control");
    fetchMyAppointments({ status: filter });
  };

  const openHistory = async (userId) => {
    setApprenticeHistory(await fetchApprenticeHistory(userId, profile.dependency_id));
    setHistoryModal(userId);
  };

  return (
    <div className="dashboard-layout">
      <SearchSidebar
        filters={searchFilters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        onSearch={handleSearch}
        isOpen={searchSidebarOpen}
        onToggle={() => setSearchSidebarOpen(!searchSidebarOpen)}
      />

      <div className="dashboard-main">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div>
              <h1>{profile?.dependencies?.name || "Enfermería"}</h1>
              <p>{profile?.full_name || "Profesional"} — Panel de atención de enfermería</p>
            </div>
            <div className="header-actions">
              <UserAvatar name={profile?.full_name} onClick={() => setSidebarOpen(true)} />
            </div>
          </header>

      <div className="bento" style={{ marginBottom: "var(--space-md)" }}>
        <div className="card card--flat">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
            <AlertCircle size={16} aria-hidden="true" /><span style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>Pendientes</span>
          </div>
          <div style={{ fontSize: "var(--text-h1)", fontWeight: 700 }}>{stats.pending}</div>
        </div>
        <div className="card card--flat">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
            <Clock size={16} aria-hidden="true" /><span style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>Confirmadas</span>
          </div>
          <div style={{ fontSize: "var(--text-h1)", fontWeight: 700 }}>{stats.confirmed}</div>
        </div>
        <div className="card card--flat">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
            <CheckCircle size={16} aria-hidden="true" /><span style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>Completadas</span>
          </div>
          <div style={{ fontSize: "var(--text-h1)", fontWeight: 700 }}>{stats.completed}</div>
        </div>
        <div className="card card--flat">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
            <TrendingUp size={16} aria-hidden="true" /><span style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>Cumplimiento</span>
          </div>
          <div style={{ fontSize: "var(--text-h1)", fontWeight: 700 }}>{completionRate}%</div>
        </div>
      </div>

      <nav className="prof-filter-tabs" role="tablist">
        {FILTERS.map((f) => {
          const FilterIcon = f.Icon;
          return (
            <button key={f.value} className={`pill ${filter === f.value ? "pill--active" : ""}`} onClick={() => setFilter(f.value)} role="tab" aria-selected={filter === f.value}>
              <FilterIcon size={14} aria-hidden="true" />{f.label}
              <span className="badge badge--sm" style={{ background: filter !== f.value ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.2)", color: filter === f.value ? "white" : undefined }}>
                {f.value === "" ? appointments.length : stats[f.value]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="bento">
        {isLoading && appointments.length === 0 ? (
          <div className="card card--elevated card--span-2"><Skeleton variant="card" height="200px" count={3} /></div>
        ) : appointments.length === 0 ? (
          <div className="card card--elevated card--span-2">
            <EmptyState icon={Calendar} title="No hay citas registradas" description="Pendientes de asignación" />
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="card card--flat">
              <div className="card__header">
                {apt.dependencies?.name && (
                  <span className="badge" style={{ background: `${apt.dependencies?.color}1a`, color: apt.dependencies?.color }}>{apt.dependencies.name}</span>
                )}
                <div style={{ display: "flex", gap: "var(--space-xs)", alignItems: "center", flexWrap: "wrap" }}>
                  {apt.attention_type && (
                    <span className="badge badge--sm"><Stethoscope size={12} aria-hidden="true" /> {ATTENTION_TYPES.find(t => t.value === apt.attention_type)?.label}</span>
                  )}
                  <span className={`badge badge--${apt.status}`}>{apt.status}</span>
                </div>
              </div>

              {apt.profiles?.full_name && (
                <div className="card__body" style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-sm)" }}>
                  <User size={14} aria-hidden="true" /><span style={{ fontWeight: 600 }}>{apt.profiles.full_name}</span>
                  {apt.profiles.document_number && <span style={{ color: "var(--text-muted)", fontSize: "var(--text-small)" }}>— Doc: {apt.profiles.document_number}</span>}
                </div>
              )}

              <div className="card__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", fontSize: "var(--text-small)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}><Calendar size={14} aria-hidden="true" /><span>{format(parseISO(apt.scheduled_date), "PPP", { locale: es })}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}><Clock size={14} aria-hidden="true" /><span>{apt.scheduled_time}</span></div>
              </div>

              <div className="card__body" style={{ marginTop: "var(--space-xs)" }}><p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>{apt.reason || "Sin motivo registrado"}</p></div>

              {apt.notes && <div className="card__body" style={{ marginTop: "var(--space-xs)", padding: "var(--space-sm)", background: "var(--neutral-100)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-small)" }}><strong>Notas:</strong> {apt.notes}</div>}

              {(apt.temperature || apt.blood_pressure) && (
                <div className="card__body" style={{ marginTop: "var(--space-xs)", display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
                  {apt.temperature && <span className="badge badge--sm"><Thermometer size={10} aria-hidden="true" /> {apt.temperature}°C</span>}
                  {apt.blood_pressure && <span className="badge badge--sm"><Activity size={10} aria-hidden="true" /> {apt.blood_pressure}</span>}
                  {apt.heart_rate && <span className="badge badge--sm"><Heart size={10} aria-hidden="true" /> {apt.heart_rate} lpm</span>}
                  {apt.weight && <span className="badge badge--sm">Peso: {apt.weight} kg</span>}
                </div>
              )}

              {apt.profiles?.full_name && (
                <div className="card__actions" style={{ marginTop: "var(--space-sm)" }}>
                  <button onClick={() => openHistory(apt.user_id)} className="btn btn-ghost btn--sm"><History size={12} aria-hidden="true" /> Ver historial</button>
                </div>
              )}

              {filter === "pending" && (
                <div className="card__footer" style={{ gap: "var(--space-sm)" }}>
                  <button onClick={() => handleConfirm(apt.id)} className="btn btn-success" style={{ flex: 1 }}><CheckCircle size={16} aria-hidden="true" /> Confirmar</button>
                  <button onClick={() => handleShow(apt.id)} className="btn btn-secondary" style={{ flex: 1 }}><XCircle size={16} aria-hidden="true" /> No Asistió</button>
                </div>
              )}

              {filter === "confirmed" && (
                <div className="card__footer" style={{ flexDirection: "column", gap: "var(--space-sm)" }}>
                  <div className="field field--static">
                    <label className="field__label"><Stethoscope size={12} aria-hidden="true" /> Tipo de Atención</label>
                    <select className="field__input" value={attentionType} onChange={(e) => setAttentionType(e.target.value)}>
                      {ATTENTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div className="field-row field-row--2">
                    <div className="field field--static"><label className="field__label"><Thermometer size={12} /> Temp (°C)</label><input className="field__input" type="text" placeholder="36.5" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} /></div>
                    <div className="field field--static"><label className="field__label"><Activity size={12} /> Presión Arterial</label><input className="field__input" type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })} /></div>
                    <div className="field field--static"><label className="field__label"><Heart size={12} /> Frec. Cardíaca</label><input className="field__input" type="text" placeholder="72 lpm" value={vitals.heart_rate} onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })} /></div>
                    <div className="field field--static"><label className="field__label">Peso (kg)</label><input className="field__input" type="text" placeholder="70" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} /></div>
                  </div>
                  <textarea className="field__input" placeholder="Observaciones de enfermería (obligatorio)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ minHeight: "60px" }} />
                  <button onClick={() => handleComplete(apt.id)} className="btn btn-primary btn--block" disabled={!notes.trim()}><CheckCircle size={16} aria-hidden="true" /> Completar Atención</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {historyModal && (
        <div className="modal-overlay" onClick={() => setHistoryModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h2><History size={20} aria-hidden="true" /> Historial de Atención</h2>
            {apprenticeHistory.length > 0 ? (
              <div className="history-timeline">
                {apprenticeHistory.map((apt) => (
                  <div key={apt.id} className={`history-item ${apt.status}`}>
                    <div className="history-item-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>{format(parseISO(apt.scheduled_date), "PPP", { locale: es })} - {apt.scheduled_time}</span>
                        <span className="badge badge--sm" style={{ background: `${apt.dependencies?.color}1a`, color: apt.dependencies?.color }}>{apt.dependencies?.name || "-"}</span>
                      </div>
                      <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginTop: "var(--space-xs)" }}>{apt.reason || "Sin motivo"}</p>
                      {apt.notes && <p style={{ fontSize: "var(--text-small)", fontStyle: "italic", color: "var(--text-muted)" }}>Notas: {apt.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon={History} title="Sin historial" description="Este aprendiz no tiene citas registradas" compact />}
            <button className="btn btn-secondary btn--block" onClick={() => setHistoryModal(null)} style={{ marginTop: "var(--space-md)" }}>Cerrar</button>
          </div>
        </div>
      )}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} appointments={appointments} />
        </div>
      </div>
    </div>
  );
}
