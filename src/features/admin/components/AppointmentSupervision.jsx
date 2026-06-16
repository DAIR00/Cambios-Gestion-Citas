import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { supabase } from "../../../lib/supabase";
import {
    Search, Calendar, Clock, CheckCircle, AlertCircle,
    XCircle, Ban, X, User, RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmadas" },
    { value: "completed", label: "Completadas" },
    { value: "cancelled", label: "Canceladas" },
    { value: "no_show", label: "No asistió" },
];

const STATUS_CONFIG = {
    pending: { color: "#f59e0b", icon: AlertCircle, label: "Pendiente" },
    confirmed: { color: "#3b82f6", icon: Clock, label: "Confirmada" },
    completed: { color: "#22c55e", icon: CheckCircle, label: "Completada" },
    cancelled: { color: "#9ca3af", icon: Ban, label: "Cancelada" },
    no_show: { color: "#ef4444", icon: XCircle, label: "No asistió" },
};

export function AppointmentSupervision() {
    const {
        allAppointments, appointmentPagination, loading,
        fetchAllAppointments, reassignAppointment, cancelAppointment,
    } = useAdmin();
    const [dependencies, setDependencies] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [filters, setFilters] = useState({
        dependencyId: "",
        professionalId: "",
        status: "",
        search: "",
        dateFrom: "",
        dateTo: "",
        page: 1,
    });
    const [detailModal, setDetailModal] = useState(null);
    const [reassignModal, setReassignModal] = useState(null);
    const [reassignProfessionals, setReassignProfessionals] = useState([]);
    const [selectedProfessional, setSelectedProfessional] = useState("");

    useEffect(() => {
        supabase.from("dependencies").select("*").then(({ data }) => setDependencies(data || []));
        supabase.from("profiles").select("id, full_name").in("role_id", [3, 4, 5]).then(({ data }) => setProfessionals(data || []));
    }, []);

    useEffect(() => {
        fetchAllAppointments(filters);
    }, [filters, fetchAllAppointments]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const openReassignModal = async (apt) => {
        if (!apt.dependency_id) return;
        const profs = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("dependency_id", apt.dependency_id)
            .in("role_id", [3, 4, 5])
            .then(({ data }) => data || []);
        setReassignProfessionals(profs);
        setReassignModal(apt);
        setSelectedProfessional("");
    };

    const handleReassign = async () => {
        if (!selectedProfessional || !reassignModal) return;
        const result = await reassignAppointment(reassignModal.id, selectedProfessional);
        if (result.success) {
            setReassignModal(null);
            fetchAllAppointments(filters);
        }
    };

    const handleCancel = async (apt) => {
        if (!window.confirm(`¿Cancelar la cita de ${apt.profiles?.full_name || "este aprendiz"}?`)) return;
        const result = await cancelAppointment(apt.id);
        if (result.success) {
            fetchAllAppointments(filters);
        }
    };

    const clearFilters = () => {
        setFilters({ dependencyId: "", professionalId: "", status: "", search: "", dateFrom: "", dateTo: "", page: 1 });
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== 1);

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Supervisión Global de Citas</h2>
                <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    Total: {appointmentPagination.total} citas
                </span>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar aprendiz..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                </div>
                <select value={filters.dependencyId} onChange={(e) => handleFilterChange("dependencyId", e.target.value)}>
                    <option value="">Todas las dependencias</option>
                    {dependencies.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <select value={filters.professionalId} onChange={(e) => handleFilterChange("professionalId", e.target.value)}>
                    <option value="">Todos los profesionales</option>
                    {professionals.map((p) => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                </select>
                <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange("dateFrom", e.target.value)} placeholder="Desde" />
                <input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange("dateTo", e.target.value)} placeholder="Hasta" />
                {hasActiveFilters && (
                    <button className="btn-secondary" onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <X size={14} /> Limpiar
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Dependencia</th>
                            <th>Aprendiz</th>
                            <th>Profesional</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: "center" }}><RefreshCw size={16} className="spin" /> Cargando...</td></tr>
                        ) : allAppointments.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: "center", color: "#9ca3af" }}>No se encontraron citas</td></tr>
                        ) : (
                            allAppointments.map((apt) => {
                                const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                                const StatusIcon = config.icon;
                                return (
                                    <tr key={apt.id}>
                                        <td>{format(parseISO(apt.scheduled_date), "dd/MM/yyyy")}</td>
                                        <td>{apt.scheduled_time}</td>
                                        <td>
                                            <span className="dep-badge" style={{ background: apt.dependencies?.color || "#ccc", fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "999px", color: "#fff" }}>
                                                {apt.dependencies?.name || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>
                                                    {apt.profiles?.full_name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <div className="name" style={{ fontSize: "0.8rem" }}>{apt.profiles?.full_name || "-"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: "0.8rem" }}>{apt.professional?.full_name || "Sin asignar"}</td>
                                        <td>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: config.color, fontSize: "0.75rem", fontWeight: 600 }}>
                                                <StatusIcon size={14} />
                                                {config.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.35rem" }}>
                                                <button className="btn-icon" onClick={() => setDetailModal(apt)} title="Ver detalles">
                                                    <Search size={14} />
                                                </button>
                                                {apt.status !== "cancelled" && apt.status !== "completed" && (
                                                    <>
                                                        <button className="btn-icon" onClick={() => openReassignModal(apt)} title="Reasignar">
                                                            <User size={14} />
                                                        </button>
                                                        <button className="btn-icon" onClick={() => handleCancel(apt)} title="Cancelar" style={{ color: "#ef4444" }}>
                                                            <Ban size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {appointmentPagination.totalPages > 1 && (
                <div className="pagination">
                    <span>Página {appointmentPagination.page} de {appointmentPagination.totalPages}</span>
                    <div className="page-controls">
                        {Array.from({ length: Math.min(appointmentPagination.totalPages, 7) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    className={filters.page === page ? "active" : ""}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal && (
                <div className="modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header">
                            <h3>Detalle de Cita</h3>
                            <button className="btn-icon" onClick={() => setDetailModal(null)}><X size={20} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Fecha:</span>
                                <span>{format(parseISO(detailModal.scheduled_date), "PPP", { locale: es })}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Hora:</span>
                                <span>{detailModal.scheduled_time}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Dependencia:</span>
                                <span className="dep-badge" style={{ background: detailModal.dependencies?.color, fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "999px", color: "#fff" }}>
                                    {detailModal.dependencies?.name}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Aprendiz:</span>
                                <span>{detailModal.profiles?.full_name || "-"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Profesional:</span>
                                <span>{detailModal.professional?.full_name || "Sin asignar"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#6b7280" }}>Estado:</span>
                                <span style={{ color: STATUS_CONFIG[detailModal.status]?.color, fontWeight: 600 }}>
                                    {STATUS_CONFIG[detailModal.status]?.label}
                                </span>
                            </div>
                            {detailModal.reason && (
                                <div>
                                    <span style={{ color: "#6b7280" }}>Motivo:</span>
                                    <p style={{ margin: "0.25rem 0 0", color: "#374151" }}>{detailModal.reason}</p>
                                </div>
                            )}
                            {detailModal.notes && (
                                <div>
                                    <span style={{ color: "#6b7280" }}>Notas:</span>
                                    <p style={{ margin: "0.25rem 0 0", color: "#374151", fontStyle: "italic" }}>{detailModal.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Modal */}
            {reassignModal && (
                <div className="modal-overlay" onClick={() => setReassignModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3>Reasignar Profesional</h3>
                            <button className="btn-icon" onClick={() => setReassignModal(null)}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
                            Cita de <strong>{reassignModal.profiles?.full_name}</strong> en {reassignModal.dependencies?.name}
                        </p>
                        <div className="field">
                            <label>Nuevo Profesional</label>
                            <select value={selectedProfessional} onChange={(e) => setSelectedProfessional(e.target.value)}>
                                <option value="">Seleccionar profesional</option>
                                {reassignProfessionals.map((p) => (
                                    <option key={p.id} value={p.id}>{p.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setReassignModal(null)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleReassign} disabled={!selectedProfessional}>
                                Reasignar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
