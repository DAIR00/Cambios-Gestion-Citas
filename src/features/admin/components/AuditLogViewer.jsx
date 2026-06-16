import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { Clock, User, Database, ArrowRight, Filter, X } from "lucide-react";

const ACTIONS_COLORS = {
    CREATE_USER: "#22c55e",
    UPDATE_USER: "#3b82f6",
    DELETE_USER: "#f59e0b",
    UPDATE_CONFIG: "#8b5cf6",
    CREATE_DEPENDENCY: "#22c55e",
    UPDATE_DEPENDENCY: "#3b82f6",
    DELETE_DEPENDENCY: "#ef4444",
    REASSIGN_APPOINTMENT: "#f97316",
};

export function AuditLogViewer() {
    const { auditLogs, fetchAuditLogs, admins, fetchAdmins, loading } = useAdmin();
    const [filters, setFilters] = useState({
        action: "",
        adminId: "",
        dateFrom: "",
        dateTo: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    useEffect(() => {
        fetchAuditLogs({
            action: filters.action || undefined,
            userId: filters.adminId || undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo ? `${filters.dateTo}T23:59:59` : undefined,
        });
    }, [fetchAuditLogs, filters]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({ action: "", adminId: "", dateFrom: "", dateTo: "" });
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== "");

    return (
        <div className="admin-section">
            <header className="section-header">
                <h2>Registro de Auditoría</h2>
                <div className="header-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                    >
                        <Filter size={16} />
                        Filtros
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="filters-bar" style={{ marginBottom: "1rem" }}>
                    <select
                        value={filters.action}
                        onChange={(e) => handleFilterChange("action", e.target.value)}
                    >
                        <option value="">Todas las acciones</option>
                        <option value="CREATE_USER">Crear usuario</option>
                        <option value="UPDATE_USER">Actualizar usuario</option>
                        <option value="UPDATE_CONFIG">Actualizar configuración</option>
                        <option value="CREATE_DEPENDENCY">Crear dependencia</option>
                        <option value="UPDATE_DEPENDENCY">Actualizar dependencia</option>
                        <option value="DELETE_DEPENDENCY">Eliminar dependencia</option>
                        <option value="REASSIGN_APPOINTMENT">Reasignar cita</option>
                    </select>
                    <select
                        value={filters.adminId}
                        onChange={(e) => handleFilterChange("adminId", e.target.value)}
                    >
                        <option value="">Todos los administradores</option>
                        {admins.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.full_name} ({a.roles?.name})
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                        placeholder="Desde"
                    />
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                        placeholder="Hasta"
                    />
                    {hasActiveFilters && (
                        <button
                            className="btn-secondary"
                            onClick={clearFilters}
                            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                        >
                            <X size={14} /> Limpiar
                        </button>
                    )}
                </div>
            )}

            <div className="audit-timeline">
                {loading ? (
                    <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Cargando...</p>
                ) : auditLogs.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No hay registros de auditoría</p>
                ) : (
                    auditLogs.map((log) => (
                        <div key={log.id} className="audit-item">
                            <div className="audit-dot" style={{ background: ACTIONS_COLORS[log.action] || '#666' }} />

                            <div className="audit-content">
                                <div className="audit-header">
                                    <span className="audit-action" style={{ color: ACTIONS_COLORS[log.action] }}>
                                        {log.action}
                                    </span>
                                    <span className="audit-time">
                                        <Clock size={14} />
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>

                                <div className="audit-details">
                                    <p>
                                        <User size={14} />
                                        <strong>{log.admin?.full_name || 'Sistema'}</strong>
                                        {' '}modificó{' '}
                                        <Database size={14} />
                                        <strong>{log.entity_type}</strong>
                                        {' '}(ID: {log.entity_id})
                                    </p>

                                    {log.old_data && log.new_data && (
                                        <div className="audit-changes">
                                            <div className="change-box old">
                                                <span className="label">Antes</span>
                                                <pre>{JSON.stringify(log.old_data, null, 2)}</pre>
                                            </div>
                                            <ArrowRight size={20} />
                                            <div className="change-box new">
                                                <span className="label">Después</span>
                                                <pre>{JSON.stringify(log.new_data, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
