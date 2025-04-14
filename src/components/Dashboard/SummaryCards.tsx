interface Props {
    data: any[];
  }
  
  export default function SummaryCards({ data }: Props) {
    const total = data.length;
    const cumplidos = data.filter((d) => d.calculatedValue >= d.target).length;
    const noCumplidos = total - cumplidos;
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold text-gray-600">Indicadores totales</h3>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold text-green-700">Cumplidos</h3>
          <p className="text-2xl font-bold text-green-900">{cumplidos}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-semibold text-red-700">No cumplidos</h3>
          <p className="text-2xl font-bold text-red-900">{noCumplidos}</p>
        </div>
      </div>
    );
  }
  