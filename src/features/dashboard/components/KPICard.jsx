export function KPICard ({ title, value, subtitle, trend, color }) {
    return (
        <div className="kpi-card" style={{ borderTop: `4px solid ${color}` }}>
            <h3>{title}</h3>
            <div className="kpi-value" style={{ color }}>
                {value}
            </div>
            {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
            {trend && (
                <span className={`kpi-trend ${trend >= 0 ? "positive" : "negative"}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </div>
    );
}