import { useState, useCallback } from "react";
import { DashboardRepository } from "../dashboard.repository";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useDashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [byDependency, setByDependency] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(false);

    const getDefaultRange = () => ({
        from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    });

    const fetchAllMetrics = useCallback(async (customRange = null) => {
        setLoading(true);
        const range = customRange || getDefaultRange();

        const results = await Promise.allSettled([
            DashboardRepository.getKPI(range),
            DashboardRepository.getAppointmentsByDependency(range),
            DashboardRepository.getMonthlyEvolution(new Date().getFullYear()),
            DashboardRepository.getProfessionalPerformance(range),
        ]);

        if (results[0].status === "fulfilled") setKpis(results[0].value[0]);
        if (results[1].status === "fulfilled") setByDependency(results[1].value);
        if (results[2].status === "fulfilled") setMonthlyTrend(results[2].value);
        if (results[3].status === "fulfilled") setProfessionals(results[3].value);

        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
            toast.error("Algunas métricas no se pudieron cargar");
            console.error("Dashboard errors:", failures.map((f) => f.reason));
        }

        setLoading(false);
    }, []);

    const exportToCSV = async (range) => {
        try {
            const data = await DashboardRepository.getRawDataForExport(range || getDefaultRange());

            const flatData = data.map((row) => ({
                ID: row.id,
                Fecha_Cita: row.scheduled_date,
                Hora: row.scheduled_time,
                Dependencia: row.dependencies?.name,
                Aprendiz: row.aprendiz?.full_name,
                Documento: row.aprendiz?.document_number,
                Profesional: row.professional?.full_name || "Sin asignar",
                Estado: row.status,
                Motivo: row.reason,
                Notas: row.notes,
                Fecha_Creacion: row.created_at,
            }));

            const headers = Object.keys(flatData[0] || {});
            const csv = [
                headers.join(","),
                ...flatData.map((row) =>
                    headers.map((h) => {
                        const val = String(row[h] || "").replace(/"/g, '""');
                        return `"${val}"`;
                    }).join(",")
                ),
            ].join("\n");

            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `reporte_bienestar_${format(new Date(), "yyyy-MM-dd")}.csv`;
            link.click();

            toast.success("Reporte descargado");
        } catch (err) {
            toast.error("Error exportando datos");
            console.error(err);
        }
    };

    return {
        kpis,
        byDependency,
        monthlyTrend,
        professionals,
        loading,
        fetchAllMetrics,
        exportToCSV,
    };
};