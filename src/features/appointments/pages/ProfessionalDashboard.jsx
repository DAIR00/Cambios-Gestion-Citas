import { useEffect, useState, useMemo } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";
import { Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, XCircle, FileText, ChevronDown, ChevronUp, List } from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";
import { SearchSidebar } from "../../../shared/components/SearchSidebar";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EmptyState } from "../../../shared/components/EmptyState";

const FILTERS = [
  { value: "pending", label: "Pendientes", Icon: AlertCircle },
  { value: "confirmed", label: "Confirmadas", Icon: Clock },
  { value: "completed", label: "Historial", Icon: CheckCircle },
];

export function ProfessionalDashboard() {
  const { appointments, fetchAppointmentsSilent, updateStatus, isLoading, searchFilters, updateSearchFilters, clearSearchFilters, fetchWithSearch } = useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchSidebarOpen, setSearchSidebarOpen] = useState(false);

  useEffect(() => { fetchAppointmentsSilent({ status: filter }); }, [filter, fetchAppointmentsSilent]);

  const handleSearch = () => {
    fetchWithSearch({ status: filter });
  };

  const handleFilterChange = (newFilters) => {
    updateSearchFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearSearchFilters();
    fetchAppointmentsSilent({ status: filter });
  };

  const stats = useMemo(() => ({
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  }), [appointments]);

  const completionRate = appointments.length > 0 ? Math.round((stats.completed / appointments.length) * 100) : 0;

  const handleConfirm = (id) => updateStatus(id, "confirmed");
  const handleComplete = (id) => { updateStatus(id, "completed", notes || "Atención completada"); setNotes(""); };
  const handleShow = (id) => updateStatus(id, "no_show");

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
              <h1>{profile?.dependencies?.name || "Mi Dependencia"}</h1>
              <p>{profile?.full_name || "Profesional"} — Gestión de citas de bienestar</p>
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
                {stats[f.value]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="bento">
        {isLoading && appointments.length === 0 ? (
          <div className="card card--elevated card--span-2"><Skeleton variant="card" height="150px" count={3} /></div>
        ) : appointments.length === 0 ? (
          <div className="card card--elevated card--span-2">
            <EmptyState icon={Calendar} title="No hay citas" description={`No hay citas ${FILTERS.find(f => f.value === filter)?.label?.toLowerCase()}`} />
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="card card--flat" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "var(--space-lg)" }}>
                <AppointmentCard appointment={apt} isAprendiz={false} />
              </div>

              <div style={{ borderTop: "1px solid var(--border-light)" }}>
                <button onClick={() => setExpandedCard(expandedCard === apt.id ? null : apt.id)} className="btn btn-ghost btn--sm" style={{ width: "100%", justifyContent: "space-between", padding: "var(--space-sm) var(--space-lg)", borderRadius: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <FileText size={14} aria-hidden="true" /> Detalles
                  </span>
                  {expandedCard === apt.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {expandedCard === apt.id && (
                <div style={{ padding: "var(--space-sm) var(--space-lg)", background: "var(--neutral-50)", fontSize: "var(--text-small)" }}>
                  <div className="detail-grid">
                    <div><span style={{ color: "var(--text-muted)" }}>Motivo: </span>{apt.reason || "No especificado"}</div>
                    <div><span style={{ color: "var(--text-muted)" }}>Dependencia: </span>
                      <span className="badge badge--sm" style={{ background: `${apt.dependencies?.color}1a`, color: apt.dependencies?.color }}>{apt.dependencies?.name || "-"}</span>
                    </div>
                    <div><span style={{ color: "var(--text-muted)" }}>Profesional: </span>{apt.professional?.full_name || "Sin asignar"}</div>
                    {apt.notes && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "var(--text-muted)" }}>Notas: </span>{apt.notes}</div>}
                  </div>
                </div>
              )}

              {filter === "pending" && (
                <div style={{ display: "flex", gap: "var(--space-sm)", padding: "var(--space-sm) var(--space-lg)", borderTop: "1px solid var(--border-light)" }}>
                  <button onClick={() => handleConfirm(apt.id)} className="btn btn-success btn--sm" style={{ flex: 1 }}><CheckCircle size={16} aria-hidden="true" /> Confirmar</button>
                  <button onClick={() => handleShow(apt.id)} className="btn btn-secondary btn--sm" style={{ flex: 1 }}><XCircle size={16} aria-hidden="true" /> No Asistió</button>
                </div>
              )}

              {filter === "confirmed" && (
                <div style={{ padding: "var(--space-sm) var(--space-lg)", borderTop: "1px solid var(--border-light)" }}>
                  <textarea className="field__input" placeholder="Notas de la atención (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ minHeight: "50px", marginBottom: "var(--space-sm)" }} />
                  <button onClick={() => handleComplete(apt.id)} className="btn btn-primary btn--block btn--sm"><CheckCircle size={16} aria-hidden="true" /> Completar Atención</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} appointments={appointments} />
        </div>
      </div>
    </div>
  );
}
