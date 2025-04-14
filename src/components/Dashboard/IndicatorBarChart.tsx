// src/components/Dashboard/IndicatorBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useResultsData } from "../../hooks/useResultsData";

interface Props {
    data: any[];
    loading: boolean;
  }
  
  export default function IndicatorBarChart({ data, loading }: Props) {
    if (loading) return <p className="text-center">Cargando datos...</p>;
    if (data.length === 0) return <p className="text-center">No hay datos para mostrar con los filtros seleccionados.</p>;
  
    const chartData = data.map((item) => ({
      sede: item.headquarterName + " - " + item.indicatorName,
      resultado: item.calculatedValue,
      meta: item.target,
    }));
  
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Comparación de resultados vs metas</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="sede" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="resultado" fill="#3b82f6" />
            <Bar dataKey="meta" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
