import { useEffect } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { KPICard } from "../../dashboard/components/KPICard";
import { DependencyChart } from "../../dashboard/components/DependencyChart";
import { MonthlyTrendChart } from "../../dashboard/components/MonthlyTrendChart";
import { RoleDistributionChart } from "./RoleDistributionChart";
import { AppointmentStatusChart } from "./AppointmentStatusChart";
import { ActivityFeed } from "./ActivityFeed";
import { RefreshCw, Users, FileBarChart, ClipboardList, Building2 } from "lucide-react";

export function AdminOverview({ onNavigate }) {
    const {
        globalStats,
        userStats,
        appointmentStatusStats,
        recentActivity,
        byDependency,
        monthlyTrend,
        fetchGlobalStats,
        fetchDependencyChartData,
        fetchMonthlyTrend,
    } = useAdmin();

    useEffect(() => {
        fetchGlobalStats();
        fetchDependencyChartData();
        fetchMonthlyTrend(new Date().getFullYear());
    }, [fetchGlobalStats, fetchDependencyChartData, fetchMonthlyTrend]);

    if (!globalStats) {
        return (
            <div className="loading-screen">
                <RefreshCw size={24} className="spin" />
                <p>Cargando estadísticas del sistema...</p>
            </div>
        );
    }

    return (
        <div className="admin-overview">
            {/* KPIs */}
            <section className="overview-kpi-grid">
                <KPICard
                    title="Total Usuarios"
                    value={globalStats.totalUsers}
                    subtitle={`${globalStats.activeUsers} activos`}
                />
                <KPICard
                    title="Total Citas"
                    value={globalStats.totalAppointments}
                    subtitle="Todas las dependencias"
                />
                <KPICard
                    title="Tasa de Cumplimiento"
                    value={`${globalStats.completionRate}%`}
                    subtitle={`${globalStats.completedAppointments} completadas`}
                />
                <KPICard
                    title="Profesionales Activos"
                    value={globalStats.activeProfessionals}
                    subtitle="Psicología + Enfermería + Trabajo Social"
                />
            </section>

            {/* Charts Grid */}
            <section className="overview-charts-grid">
                <DependencyChart data={byDependency} />
                <RoleDistributionChart data={userStats} />
                <MonthlyTrendChart data={monthlyTrend} />
                <AppointmentStatusChart data={appointmentStatusStats} />
            </section>

            {/* Activity + Quick Actions */}
            <div className="overview-bottom-grid">
                <ActivityFeed data={recentActivity} />

                <div className="quick-actions">
                    <h3>Acciones Rápidas</h3>
                    <div className="quick-actions-grid">
                        <button
                            className="quick-action-btn"
                            onClick={() => onNavigate?.("users")}
                        >
                            <Users size={24} />
                            <div>
                                <strong>Gestión de Usuarios</strong>
                                <span>Crear, editar y administrar usuarios</span>
                            </div>
                        </button>
                        <button
                            className="quick-action-btn"
                            onClick={() => onNavigate?.("reports")}
                        >
                            <FileBarChart size={24} />
                            <div>
                                <strong>Generar Reporte</strong>
                                <span>Reportes de citas y exportación</span>
                            </div>
                        </button>
                        <button
                            className="quick-action-btn"
                            onClick={() => onNavigate?.("audit")}
                        >
                            <ClipboardList size={24} />
                            <div>
                                <strong>Ver Auditoría</strong>
                                <span>Registro de acciones del sistema</span>
                            </div>
                        </button>
                        <button
                            className="quick-action-btn"
                            onClick={() => onNavigate?.("dependencies")}
                        >
                            <Building2 size={24} />
                            <div>
                                <strong>Dependencias</strong>
                                <span>Gestionar dependencias del SENA</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
