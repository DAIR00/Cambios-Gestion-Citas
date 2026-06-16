import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

export function useReports() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);

    const generateReport = async (filters = {}) => {
        setLoading(true);
        try {
            let query = supabase
                .from("appointments")
                .select(`
                    *,
                    dependencies (name, color),
                    aprendiz: profiles!user_id (full_name, document_number),
                    professional: profiles!professional_id (full_name)
                `);

            if (filters.dependencyId) {
                query = query.eq("dependency_id", filters.dependencyId);
            }
            if (filters.professionalId) {
                query = query.eq("professional_id", filters.professionalId);
            }
            if (filters.status) {
                query = query.eq("status", filters.status);
            }
            if (filters.dateFrom) {
                query = query.gte("scheduled_date", filters.dateFrom);
            }
            if (filters.dateTo) {
                query = query.lte("scheduled_date", filters.dateTo);
            }

            query = query
                .order("scheduled_date", { ascending: false })
                .order("scheduled_time", { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            setReportData(data || []);
            calculateSummary(data || []);
            toast.success(`Reporte generado: ${data?.length || 0} citas`);
            return data || [];
        } catch (err) {
            toast.error("Error generando reporte");
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data) => {
        const total = data.length;
        const completed = data.filter((a) => a.status === "completed").length;
        const pending = data.filter((a) => a.status === "pending").length;
        const confirmed = data.filter((a) => a.status === "confirmed").length;
        const cancelled = data.filter((a) => a.status === "cancelled").length;
        const noShow = data.filter((a) => a.status === "no_show").length;

        const byDependency = data.reduce((acc, apt) => {
            const name = apt.dependencies?.name || "Sin dependencia";
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const byProfessional = data.reduce((acc, apt) => {
            const name = apt.professional?.full_name || "Sin asignar";
            if (!acc[name]) acc[name] = { total: 0, completed: 0 };
            acc[name].total++;
            if (apt.status === "completed") acc[name].completed++;
            return acc;
        }, {});

        setSummary({
            total,
            completed,
            pending,
            confirmed,
            cancelled,
            noShow,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            byDependency,
            byProfessional,
        });
    };

    const exportToCSV = (data, filename) => {
        const rows = data.map((apt) => ({
            ID: apt.id,
            Fecha: apt.scheduled_date,
            Hora: apt.scheduled_time,
            Dependencia: apt.dependencies?.name || "",
            Aprendiz: apt.aprendiz?.full_name || "",
            Documento: apt.aprendiz?.document_number || "",
            Profesional: apt.professional?.full_name || "Sin asignar",
            Estado: apt.status,
            Motivo: apt.reason || "",
            Notas: apt.notes || "",
            Creado: apt.created_at,
        }));

        const headers = Object.keys(rows[0] || {});
        const csv = [
            headers.join(","),
            ...rows.map((row) =>
                headers.map((h) => {
                    const val = String(row[h] || "").replace(/"/g, '""');
                    return `"${val}"`;
                }).join(",")
            ),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename || "reporte"}_${format(new Date(), "yyyy-MM-dd")}.csv`;
        link.click();
        toast.success("Reporte descargado");
    };

    const exportToPDF = (data, title) => {
        const printWindow = window.open("", "_blank");
        const rows = data.map((apt) => `
            <tr>
                <td>${apt.scheduled_date}</td>
                <td>${apt.scheduled_time}</td>
                <td>${apt.dependencies?.name || ""}</td>
                <td>${apt.aprendiz?.full_name || ""}</td>
                <td>${apt.professional?.full_name || "Sin asignar"}</td>
                <td>${apt.status}</td>
                <td>${apt.reason || ""}</td>
            </tr>
        `).join("");

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title || "Reporte de Citas"}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #1a1a1a; font-size: 1.5rem; }
                    .meta { color: #666; margin-bottom: 1rem; font-size: 0.85rem; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.8rem; }
                    th { background: #f5f5f5; font-weight: 600; }
                    tr:nth-child(even) { background: #fafafa; }
                    .summary { display: flex; gap: 2rem; margin: 1rem 0; }
                    .summary-item { text-align: center; }
                    .summary-item .value { font-size: 1.5rem; font-weight: 700; color: #39a900; }
                    .summary-item .label { font-size: 0.75rem; color: #666; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>${title || "Reporte de Citas"}</h1>
                <div class="meta">Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}</div>
                <div class="summary">
                    <div class="summary-item"><div class="value">${data.length}</div><div class="label">Total</div></div>
                    <div class="summary-item"><div class="value">${data.filter(a => a.status === "completed").length}</div><div class="label">Completadas</div></div>
                    <div class="summary-item"><div class="value">${data.filter(a => a.status === "pending").length}</div><div class="label">Pendientes</div></div>
                    <div class="summary-item"><div class="value">${data.filter(a => a.status === "cancelled").length}</div><div class="label">Canceladas</div></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th><th>Hora</th><th>Dependencia</th>
                            <th>Aprendiz</th><th>Profesional</th><th>Estado</th><th>Motivo</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return {
        reportData,
        summary,
        loading,
        generateReport,
        exportToCSV,
        exportToPDF,
    };
}
