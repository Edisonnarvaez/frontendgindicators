import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface Props {
  data: any[];
  loading: boolean;
  top?: number;
}

export default function WorstIndicatorsChart({ data, loading, top = 5 }: Props) {
  if (loading) return <p className="text-center">Cargando ranking...</p>;
  if (data.length === 0) return <p className="text-center">No hay datos para mostrar.</p>;

  // Calcular diferencia contra la meta
  const ranked = data
    .map((item) => ({
      ...item,
      diferencia: item.calculatedValue - item.target,
    }))
    .sort((a, b) => a.diferencia - b.diferencia) // de menor a mayor
    .slice(0, top); // top N peores

  const chartData = ranked.map((item) => ({
    name: `${item.indicatorName} (${item.headquarterName})`,
    valor: item.calculatedValue,
    meta: item.target,
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Indicadores con peor desempeño</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart layout="vertical" data={chartData} margin={{ left: 80 }}>
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Bar dataKey="valor" fill="#ef4444">
            <LabelList dataKey="valor" position="right" />
          </Bar>
          <Bar dataKey="meta" fill="#10b981">
            <LabelList dataKey="meta" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
