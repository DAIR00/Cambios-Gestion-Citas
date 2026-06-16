import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export const MonthlyTrendChart = ({ data }) => {
    return (
        <div className='chart-container'>
            <h3>Tendencia Mensual</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                    type="monotone" dataKey="total" 
                    stroke="#39A900"
                    name="Total"  
                    strokeWidth={2} 
                    />
                    <Line 
                    type="monotone" dataKey="completed" 
                    stroke="#22c55e" 
                    name="Completadas" 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}