import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_CONFIG = {
    pending: { label: "Pendientes", color: "#f59e0b" },
    confirmed: { label: "Confirmadas", color: "#3b82f6" },
    completed: { label: "Completadas", color: "#22c55e" },
    cancelled: { label: "Canceladas", color: "#9ca3af" },
    no_show: { label: "No asistió", color: "#ef4444" },
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { status, count } = payload[0].payload;
        const config = STATUS_CONFIG[status] || { label: status, color: "#6b7280" };
        return (
            <div style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "var(--radius-sm)",
                padding: "0.5rem 0.75rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                fontSize: "0.8rem",
            }}>
                <p style={{ fontWeight: 600, margin: 0, color: config.color }}>{config.label}</p>
                <p style={{ margin: "0.25rem 0 0", color: "#6b7280" }}>{count} citas</p>
            </div>
        );
    }
    return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function AppointmentStatusChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-container">
                <h3>Estado de Citas</h3>
                <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Sin datos disponibles</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3>Estado de Citas</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="status"
                        labelLine={false}
                        label={CustomLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={STATUS_CONFIG[entry.status]?.color || "#6b7280"}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                flexWrap: "wrap",
                marginTop: "0.5rem",
                fontSize: "0.75rem",
            }}>
                {data.map((entry) => {
                    const config = STATUS_CONFIG[entry.status] || { label: entry.status, color: "#6b7280" };
                    return (
                        <div key={entry.status} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color }} />
                            <span style={{ color: "#6b7280" }}>{config.label}: {entry.count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
