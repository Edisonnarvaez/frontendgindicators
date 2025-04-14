import React, { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import IndicatorDetailModal from "./IndicatorDetailModal";


interface Props {
    data: any[];
    loading: boolean;
}

function formatPeriodo(item: any) {
    switch (item.measurementFrequency) {
        case "monthly":
            return `${item.year}-${String(item.month).padStart(2, "0")}`;
        case "quarterly":
            return `Q${item.quarter} ${item.year}`;
        case "semesterly":
            return `S${item.semester} ${item.year}`;
        case "annually":
            return `${item.year}`;
        default:
            return `${item.year}`;
    }
}

export default function IndicatorTable({ data, loading }: Props) {
    if (loading) return <p className="text-center">Cargando tabla...</p>;
    if (data.length === 0) return <p className="text-center">No hay datos para mostrar.</p>;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState<any>(null);


    return (
        <div className="overflow-x-auto bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-end gap-4 mb-4">
                <button
                    onClick={() => exportToExcel(data)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Exportar a Excel
                </button>
                <button
                    onClick={() => exportToPDF(data)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Exportar a PDF
                </button>
            </div>

            <h2 className="text-lg font-semibold mb-4">Tabla de Resultados</h2>
            <table className="min-w-full text-sm text-left">

                <thead className="bg-gray-100 border-b font-medium">
                    <tr>

                        <th className="px-4 py-2">Indicador</th>
                        <th className="px-4 py-2">Sede</th>
                        <th className="px-4 py-2">Resultado</th>
                        <th className="px-4 py-2">Meta</th>
                        <th className="px-4 py-2">Unidad</th>
                        <th className="px-4 py-2">Período</th>
                        <th className="px-4 py-2">Cumple</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => {
                        const cumple = item.calculatedValue >= item.target;
                        return (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => {
                                            setSelectedIndicator(item);
                                            setModalOpen(true);
                                        }}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {item.indicatorName}
                                    </button>
                                </td>
                                <td className="px-4 py-2">{item.headquarterName}</td>
                                <td className="px-4 py-2">{item.calculatedValue.toFixed(2)}</td>
                                <td className="px-4 py-2">{item.target.toFixed(2)}</td>
                                <td className="px-4 py-2">{item.measurementUnit}</td>
                                <td className="px-4 py-2">{formatPeriodo(item)}</td>
                                <td className="px-4 py-2">
                                    {cumple ? (
                                        <CheckCircleIcon className="text-green-500 w-5 h-5" />
                                    ) : (
                                        <XCircleIcon className="text-red-500 w-5 h-5" />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>
            <IndicatorDetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                indicator={selectedIndicator}
                results={data}
            />


        </div>
    );
}
