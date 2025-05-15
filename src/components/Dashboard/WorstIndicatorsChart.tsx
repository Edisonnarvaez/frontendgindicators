import React, { useMemo } from "react";
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
    .sort((a, b) => a.diferencia - b.diferencia)
    .slice(0, top);

  const chartData = ranked.map((item) => ({
    name: `${item.indicatorName} (${item.headquarterName})`,
    valor: item.calculatedValue,
    meta: item.target,
  }));

  // Calcular el ancho necesario para la YAxis basado en el nombre más largo
  const maxLabelLength = useMemo(() => {
    return Math.max(...chartData.map((item) => item.name.length));
  }, [chartData]);

  // Ajustar el margen izquierdo dinámicamente (mínimo 80px, máximo 200px)
  const leftMargin = Math.min(Math.max(maxLabelLength * 6, 80), 200);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full min-w-[300px]">
      <h2 className="text-lg font-semibold mb-4">Indicadores con peor desempeño</h2>
      <ResponsiveContainer width="100%" height={top * 60 + 100}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ left: leftMargin, right: 20, top: 20, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            tickFormatter={(value: string) =>
              value.length > 20 ? `${value.slice(0, 17)}...` : value
            }
            width={leftMargin}
          />
          <Tooltip />
          <Bar dataKey="valor" fill="#ef4444" barSize={20}>
            <LabelList
              dataKey="valor"
              position="right"
              formatter={(value: number) => value.toFixed(2)}
              style={{ fontSize: 12 }}
            />
          </Bar>
          <Bar dataKey="meta" fill="#10b981" barSize={20}>
            <LabelList
              dataKey="meta"
              position="right"
              formatter={(value: number) => value.toFixed(2)}
              style={{ fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}