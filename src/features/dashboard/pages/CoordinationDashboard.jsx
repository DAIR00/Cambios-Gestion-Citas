import { useEffect, useState } from "react";
import { useDashboard } from "../api/hooks/useDashboard";
import { useAuth } from "../../../providers/AuthProvider";
import { KPICard } from "../components/KPICard";
import { DependencyChart } from "../components/DependencyChart";
import { MonthlyTrendChart } from "../components/MonthlyTrendChart";
import { ProfessionalTable } from "../components/ProfessionalTable";
import { ReportGenerator } from "../../appointments/components/ReportGenerator";
import { Download, RefreshCw, Calendar, FileBarChart } from "lucide-react";
import UserAvatar from "../../../shared/components/UserAvatar";
import UserSidebar from "../../../shared/components/UserSidebar";
import { Skeleton } from "../../../shared/components/Skeleton";
import { format, subMonths } from "date-fns";

function LoadingState() {
  return (
    <div className="skeleton-bento">
      <div className="skeleton-card"><Skeleton variant="heading" /><Skeleton variant="chart" /></div>
      <div className="skeleton-card"><Skeleton variant="heading" /><Skeleton variant="chart" /></div>
      <div className="skeleton-card"><Skeleton variant="heading" /><Skeleton variant="chart" /></div>
      <div className="skeleton-card"><Skeleton variant="heading" /><Skeleton variant="chart" /></div>
    </div>
  );
}

export default function CoordinationDashboard() {
  const { kpis, byDependency, monthlyTrend, professionals, loading, fetchAllMetrics, exportToCSV } = useDashboard();
  const { profile } = useAuth();
  const [dataRange, setDataRange] = useState({
    from: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAllMetrics(dataRange);
  }, [dataRange, fetchAllMetrics]);

  const handleDateChange = (field, value) => {
    setDataRange((prev) => ({ ...prev, [field]: value }));
  };

  if (loading && !kpis) {
    return <div className="dashboard-container"><LoadingState /></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel de Coordinación</h1>
          <p>Vista general del bienestar institucional</p>
        </div>
        <div className="header-actions">
          {activeTab === "dashboard" && (
            <>
              <button onClick={() => fetchAllMetrics(dataRange)} className="btn btn-secondary">
                <RefreshCw size={18} aria-hidden="true" />
                Actualizar
              </button>
              <button onClick={() => exportToCSV(dataRange)} className="btn btn-primary">
                <Download size={18} aria-hidden="true" />
                Exportar CSV
              </button>
            </>
          )}
          <UserAvatar name={profile?.full_name} onClick={() => setSidebarOpen(true)} />
        </div>
      </header>

      <nav className="coordination-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
          role="tab"
          aria-selected={activeTab === "dashboard"}
        >
          <Calendar size={18} aria-hidden="true" />
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
          role="tab"
          aria-selected={activeTab === "reports"}
        >
          <FileBarChart size={18} aria-hidden="true" />
          Reportes
        </button>
      </nav>

      {activeTab === "dashboard" && (
        <>
          <div className="date-filter-bar">
            <Calendar size={18} aria-hidden="true" />
            <input type="date" value={dataRange.from} onChange={(e) => handleDateChange("from", e.target.value)} className="date-input" />
            <span style={{ color: "var(--text-muted)" }}>hasta</span>
            <input type="date" value={dataRange.to} onChange={(e) => handleDateChange("to", e.target.value)} className="date-input" />
          </div>

          {kpis && (
            <div className="bento" style={{ marginBottom: "var(--space-md)" }}>
              <KPICard title="Total Citas" value={kpis.total_appointments} color="var(--color-info)" subtitle="En periodo seleccionado" />
              <KPICard title="Tasa de Cumplimiento" value={kpis.total_appointments > 0 ? `${Math.round((kpis.completed_appointments / kpis.total_appointments) * 100)}%` : "0%"} color="var(--color-success)" subtitle={`${kpis.completed_appointments} completadas`} />
              <KPICard title="Tiempo Promedio" value={`${Math.round(kpis.avg_wait_days || 0)} días`} color="var(--color-warning)" subtitle="Solicitud a atención" />
              <KPICard title="No Asistencias" value={kpis.no_show_count} color="var(--color-error)" subtitle={kpis.total_appointments > 0 ? `${Math.round((kpis.no_show_count / kpis.total_appointments) * 100)}% del total` : "0%"} />
            </div>
          )}

          <div className="bento" style={{ marginBottom: "var(--space-md)" }}>
            <div className="card card--elevated"><DependencyChart data={byDependency} /></div>
            <div className="card card--elevated"><MonthlyTrendChart data={monthlyTrend} /></div>
          </div>

          <div className="card card--elevated">
            <ProfessionalTable data={professionals} />
          </div>
        </>
      )}

      {activeTab === "reports" && (
        <ReportGenerator title="Reporte de Citas - Coordinación" variant="full" />
      )}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
