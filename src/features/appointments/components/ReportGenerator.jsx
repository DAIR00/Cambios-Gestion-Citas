import { useState, useEffect } from "react";
import { useReports } from "../hooks/useReports";
import { supabase } from "../../../lib/supabase";
import { FileText, Download, Printer, Filter, X } from "lucide-react";

const STATUS_OPTIONS = [
    { value: "", label: "Todos los estados" },
    { value: "pending", label: "Pendientes" },
    { value: "confirmed", label: "Confirmadas" },
    { value: "completed", label: "Completadas" },
    { value: "cancelled", label: "Canceladas" },
    { value: "no_show", label: "No asistió" },
];

export function ReportGenerator({ title = "Reporte de Citas" }) {
    const { reportData, summary, loading, generateReport, exportToCSV, exportToPDF } = useReports();
    const [dependencies, setDependencies] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dependencyId: "",
        professionalId: "",
        status: "",
        dateFrom: "",
        dateTo: "",
    });

    useEffect(() => {
        supabase.from("dependencies").select("*").then(({ data }) => setDependencies(data || []));
        supabase
            .from("profiles")
            .select("id, full_name")
            .not("role_id", "is", null)
            .then(({ data }) => setProfessionals(data || []));
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerate = () => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== "")
        );
        generateReport(cleanFilters);
    };

    const hasResults = reportData.length > 0;

    return (
        <div className="report-generator">
            <div className="report-header">
                <div className="report-title">
                    <FileText size={20} />
                    <h2>{title}</h2>
                </div>
                <div className="report-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filtros
                    </button>
                    {hasResults && (
                        <>
                            <button
                                className="btn-secondary"
                                onClick={() => exportToCSV(reportData, title.toLowerCase().replace(/\s/g, "_"))}
                            >
                                <Download size={16} />
                                CSV
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => exportToPDF(reportData, title)}
                            >
                                <Printer size={16} />
                                Imprimir
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="report-filters">
                    <div className="filters-grid">
                        <div className="field">
                            <label>Dependencia</label>
                            <select
                                value={filters.dependencyId}
                                onChange={(e) => handleFilterChange("dependencyId", e.target.value)}
                            >
                                <option value="">Todas</option>
                                {dependencies.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Profesional</label>
                            <select
                                value={filters.professionalId}
                                onChange={(e) => handleFilterChange("professionalId", e.target.value)}
                            >
                                <option value="">Todos</option>
                                {professionals.map((p) => (
                                    <option key={p.id} value={p.id}>{p.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Estado</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Desde</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label>Hasta</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                            {loading ? "Generando..." : "Generar Reporte"}
                        </button>
                        <button className="btn-secondary" onClick={() => { setFilters({ dependencyId: "", professionalId: "", status: "", dateFrom: "", dateTo: "" }); }}>
                            <X size={16} />
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            {!showFilters && !hasResults && (
                <div className="report-placeholder">
                    <p>Selecciona los filtros y haz clic en "Generar Reporte" para ver los resultados.</p>
                    <button className="btn-primary" onClick={() => setShowFilters(true)}>
                        <Filter size={16} />
                        Configurar Filtros
                    </button>
                </div>
            )}

            {hasResults && summary && (
                <>
                    <div className="report-summary">
                        <div className="summary-card">
                            <span className="summary-value">{summary.total}</span>
                            <span className="summary-label">Total Citas</span>
                        </div>
                        <div className="summary-card success">
                            <span className="summary-value">{summary.completed}</span>
                            <span className="summary-label">Completadas</span>
                        </div>
                        <div className="summary-card info">
                            <span className="summary-value">{summary.pending + summary.confirmed}</span>
                            <span className="summary-label">Activas</span>
                        </div>
                        <div className="summary-card warning">
                            <span className="summary-value">{summary.cancelled}</span>
                            <span className="summary-label">Canceladas</span>
                        </div>
                        <div className="summary-card danger">
                            <span className="summary-value">{summary.noShow}</span>
                            <span className="summary-label">No Asistió</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-value">{summary.completionRate}%</span>
                            <span className="summary-label">Cumplimiento</span>
                        </div>
                    </div>

                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Dependencia</th>
                                    <th>Aprendiz</th>
                                    <th>Profesional</th>
                                    <th>Estado</th>
                                    <th>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>{apt.scheduled_date}</td>
                                        <td>{apt.scheduled_time}</td>
                                        <td>
                                            <span
                                                className="dep-badge"
                                                style={{ background: apt.dependencies?.color || "#ccc" }}
                                            >
                                                {apt.dependencies?.name || "-"}
                                            </span>
                                        </td>
                                        <td>{apt.aprendiz?.full_name || "-"}</td>
                                        <td>{apt.professional?.full_name || "Sin asignar"}</td>
                                        <td>
                                            <span className={`status-badge status-${apt.status}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="reason-cell">{apt.reason || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="report-footer">
                        <span>{reportData.length} registros encontrados</span>
                    </div>
                </>
            )}
        </div>
    );
}
