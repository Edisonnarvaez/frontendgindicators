import React, { useState, useMemo } from "react";
import { useResultsData } from "../../hooks/useResultsData";
import FilterSelect from "../Shared/FilterSelect";
import IndicatorBarChart from "./IndicatorBarChart";
import TimeSeriesChart from "./TimeSeriesChart";
import IndicatorTable from "./IndicatorTable";
import SummaryCards from "./SummaryCards";
import CompliancePieChart from "./CompliancePieChart";
import WorstIndicatorsChart from "./WorstIndicatorsChart";

export default function DashboardPage() {
    const { data, loading } = useResultsData();

    const [selectedSede, setSelectedSede] = useState("");
    const [selectedIndicador, setSelectedIndicador] = useState("");
    const [selectedUnidad, setSelectedUnidad] = useState("");
    const [selectedFrecuencia, setSelectedFrecuencia] = useState("");
    const [selectedAnio, setSelectedAnio] = useState("");

    // Obtener opciones únicas
    const sedes = [...new Set(data.map((item) => item.headquarterName))];
    const indicadores = [...new Set(data.map((item) => item.indicatorName))];
    const unidades = [...new Set(data.map((item) => item.measurementUnit))];
    const frecuencias = [...new Set(data.map((item) => item.measurementFrequency))];
    const anios = [...new Set(data.map((item) => String(item.year)))].sort((a, b) => Number(b) - Number(a));

    // Filtro de datos
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            return (
                (!selectedSede || item.headquarterName === selectedSede) &&
                (!selectedIndicador || item.indicatorName === selectedIndicador) &&
                (!selectedUnidad || item.measurementUnit === selectedUnidad) &&
                (!selectedFrecuencia || item.measurementFrequency === selectedFrecuencia) &&
                (!selectedAnio || String(item.year) === selectedAnio)
            );
        });
    }, [data, selectedSede, selectedIndicador, selectedUnidad, selectedFrecuencia, selectedAnio]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard de Resultados</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <FilterSelect label="Sede" options={sedes} value={selectedSede} onChange={setSelectedSede} />
                <FilterSelect label="Indicador" options={indicadores} value={selectedIndicador} onChange={setSelectedIndicador} />
                <FilterSelect label="Unidad de Medida" options={unidades} value={selectedUnidad} onChange={setSelectedUnidad} />
                <FilterSelect label="Frecuencia" options={frecuencias} value={selectedFrecuencia} onChange={setSelectedFrecuencia} />
                <FilterSelect label="Año" options={anios} value={selectedAnio} onChange={setSelectedAnio} />
            </div>

            <SummaryCards data={filteredData} />
            <IndicatorBarChart data={filteredData} loading={loading} />
            <TimeSeriesChart data={filteredData} loading={loading} />
            <CompliancePieChart data={filteredData} loading={loading} />
            <WorstIndicatorsChart data={filteredData} loading={loading} />
            <IndicatorTable data={filteredData} loading={loading} />
        </div>
    );
}
