export function KPICard ({ title, value, subtitle, trend }) {
    return (
        <div className="kpi-card">
            <h3>{title}</h3>
            <div className="kpi-value">
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