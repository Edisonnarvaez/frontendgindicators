import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";

interface Headquarters {
  id: number;
  name: string;
}

interface Indicator {
  id: number;
  name: string;
}

interface Result {
  id?: number;
  headquarters: number;
  indicator: number;
  numerator: number;
  denominator: number;
  calculatedValue: number;
  year: number;
  month: number;
  quarter: number;
  semester: number;
}

const ResultComponent: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [form, setFormData] = useState<Partial<Result>>({
    headquarters: 0,
    indicator: 0,
    numerator: 0,
    denominator: 0,
    calculatedValue: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: 0,
    semester: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);
  const [headquartersFilter, setHeadquartersFilter] = useState<string>("");
  const [indicatorFilter, setIndicatorFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, indicatorsRes, headquartersRes] = await Promise.all([
          axios.get("http://localhost:8000/api/results/"),
          axios.get("http://localhost:8000/api/indicators/"),
          axios.get("http://localhost:8000/api/headquarters/"),
        ]);

        setResults(resultsRes.data);
        setIndicators(indicatorsRes.data);
        setHeadquarters(headquartersRes.data);
        setFilteredResults(resultsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...form,
      [name]: name === "headquarters" || name === "indicator" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = { ...form, user: 1 }; // Ajusta el usuario según sea necesario.
      if (isEditing && form.id) {
        const response = await axios.put(`http://localhost:8000/api/results/${form.id}/`, formData);
        setResults((prev) =>
          prev.map((result) => (result.id === response.data.id ? response.data : result))
        );
        alert("Resultado actualizado exitosamente.");
      } else {
        const response = await axios.post("http://localhost:8000/api/results/", formData);
        setResults((prev) => [...prev, response.data]);
        alert("Resultado creado exitosamente.");
      }
      setFormData({
        headquarters: 0,
        indicator: 0,
        numerator: 0,
        denominator: 0,
        calculatedValue: 0,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        quarter: 0,
        semester: 0,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error al guardar el resultado:", err);
      alert("Error al guardar el resultado.");
    }
  };

const handleEdit = (result: Result) => {
  setFormData(result);
  setIsEditing(true);
  setFormVisible(true);
};

  const toggleFormVisibility = () => {
    setFormVisible((prev) => !prev);
  };
  const handleFilter = () => {
    const filtered = results.filter(
      (result) =>
        (headquartersFilter ? result.headquarters === Number(headquartersFilter) : true) &&
        (indicatorFilter ? result.indicator === Number(indicatorFilter) : true)
    );
    setFilteredResults(filtered);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este resultado?")) {
      try {
        await axios.delete(`http://localhost:8000/api/results/${id}/`);
        setResults((prev) => prev.filter((r) => r.id !== id));
        alert("Resultado eliminado exitosamente.");
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el resultado.");
      }
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-6">Resultados de Indicadores</h1>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <button
            onClick={toggleFormVisibility}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isFormVisible ? "Ocultar Formulario" : "Agregar Nuevo Resultado"}
          </button>

          {isFormVisible && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">
                {isEditing ? "Editar Resultado" : "Agregar Nuevo Resultado"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sede</label>
                  <select
                    name="headquarters"
                    value={form.headquarters}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione...</option>
                    {headquarters.map((hq) => (
                      <option key={hq.id} value={hq.id}>
                        {hq.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Indicador</label>
                  <select
                    name="indicator"
                    value={form.indicator}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione...</option>
                    {indicators.map((indicator) => (
                      <option key={indicator.id} value={indicator.id}>
                        {indicator.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numerador</label>
                  <input
                    type="number"
                    name="numerator"
                    value={form.numerator}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Denominador</label>
                  <input
                    type="number"
                    name="denominator"
                    value={form.denominator}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Año</label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mes</label>
                  <input
                    type="number"
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trimestre</label>
                  <input
                    type="number"
                    name="quarter"
                    value={form.quarter}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semestre</label>
                  <input
                    type="number"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="sm:col-span-2 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        headquarters: 0,
                        indicator: 0,
                        numerator: 0,
                        denominator: 0,
                        calculatedValue: 0,
                        year: new Date().getFullYear(),
                        month: new Date().getMonth() + 1,
                        quarter: 0,
                        semester: 0,
                      });
                      setIsEditing(false);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {isEditing ? "Actualizar" : "Guardar"}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>


        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600">Sede</label>
              <select
                value={headquartersFilter}
                onChange={(e) => setHeadquartersFilter(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione...</option>
                {headquarters.map((hq) => (
                  <option key={hq.id} value={hq.id}>
                    {hq.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600">Indicador</label>
              <select
                value={indicatorFilter}
                onChange={(e) => setIndicatorFilter(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione...</option>
                {indicators.map((indicator) => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex justify-center items-end">
              <button
                onClick={handleFilter}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Sede</th>
                <th className="px-4 py-2">Indicador</th>
                <th className="px-4 py-2">Año</th>
                <th className="px-4 py-2">Numerador</th>
                <th className="px-4 py-2">Denominador</th>
                <th className="px-4 py-2">Resultado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result) => {
                const hqName = headquarters.find((hq) => hq.id === result.headquarters)?.name || "N/A";
                const indicatorName = indicators.find((ind) => ind.id === result.indicator)?.name || "N/A";

                return (
                  <tr key={result.id}>
                    <td className="px-4 py-2">{hqName}</td>
                    <td className="px-4 py-2">{indicatorName}</td>
                    <td className="px-4 py-2">{result.year}</td>
                    <td className="px-4 py-2">{result.numerator}</td>
                    <td className="px-4 py-2">{result.denominator}</td>
                    <td className="px-4 py-2">{result.calculatedValue}</td>
                    <td className="px-4 py-2">
                      <button
                        className="px-2 py-1 text-white bg-green-500 rounded-md mr-2"
                        onClick={() => handleEdit(result)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-2 py-1 text-white bg-red-500 rounded-md"
                        onClick={() => result.id && handleDelete(result.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table>
        </div>

        
      </div>
    </Layout>
  );
};

export default ResultComponent;
