import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";

interface Indicator {
  id: number;
  name: string;
}

interface Headquarters {
  id: number;
  name: string;
}

interface Result {
  id: number;
  headquarters: string;
  indicator: string;
  numerator: number;
  denominator: number;
  year: number;
  month: number;
  quarter: number;
  semester: number;
  //calculationMethod: string;
}

const ResultComponent: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setFormData] = useState<Partial<Result>>({
    headquarters: "",
    indicator: "",
    numerator: 0,
    denominator: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: 0,
    semester: 0,
    //calculationMethod: "",
  });

  const [headquartersFilter, setHeadquartersFilter] = useState<string>("");
  const [indicatorFilter, setIndicatorFilter] = useState<string>("");

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
    setFormData({ ...form, [name]: value });
  };

  const handleFilter = () => {
    const filtered = results.filter(
      (result) =>
        (headquartersFilter ? result.headquarters === headquartersFilter : true) &&
        (indicatorFilter ? result.indicator === indicatorFilter : true)
    );
    setFilteredResults(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      ...form,
      user: 1, // Usuario fijo, ajustar según sea necesario.
    };

    console.log(formData)

    try {
      if (isEditing) {
        const response = await axios.put(
          `http://localhost:8000/api/results/${form.id}/`,
          formData
        );
        setResults((prev) =>
          prev.map((r) => (r.id === response.data.id ? response.data : r))
        );
        alert("Resultado actualizado exitosamente.");
      } else {
        const response = await axios.post("http://localhost:8000/api/results/", formData);
        setResults((prev) => [...prev, response.data]);
        alert("Resultado creado exitosamente.");
      }

      setIsModalOpen(false);
      setFormData({
        headquarters: "",
        indicator: "",
        numerator: 0,
        denominator: 0,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        quarter: 0,
        semester: 0,
        //calculationMethod: "",
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el resultado.");
    }
  };

  const handleEdit = (result: Result) => {
    setFormData(result);
    setIsEditing(true);
    setIsModalOpen(true);
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

  if (loading) return <Layout>Loading...</Layout>;
  if (error) return <Layout>{error}</Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">Resultados de Indicadores</h1>

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
                  <option key={hq.id} value={hq.name}>
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
                  <option key={indicator.id} value={indicator.name}>
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

        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            setFormData({
              headquarters: "",
              indicator: "",
              numerator: 0,
              denominator: 0,
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              quarter: 0,
              semester: 0,
              //calculationMethod: "",
            });
          }}
        >
          Agregar Resultado
        </button>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Sede</th>
                <th className="px-4 py-2">Indicador</th>
                <th className="px-4 py-2">Año</th>
                <th className="px-4 py-2">Mes</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td className="px-4 py-2">{result.headquarters}</td>
                  <td className="px-4 py-2">{result.indicator}</td>
                  <td className="px-4 py-2">{result.year}</td>
                  <td className="px-4 py-2">{result.month}</td>
                  <td className="px-4 py-2">
                    <button
                      className="px-2 py-1 text-white bg-green-500 rounded-md mr-2"
                      onClick={() => handleEdit(result)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 text-white bg-red-500 rounded-md"
                      onClick={() => handleDelete(result.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">{isEditing ? "Editar Resultado" : "Agregar Resultado"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Sede</label>
                <select
                  name="headquarters"
                  value={form.headquarters}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione...</option>
                  {headquarters.map((hq) => (
                    <option key={hq.id} value={hq.name}>
                      {hq.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Indicador</label>
                <select
                  name="indicator"
                  value={form.indicator}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Seleccione...</option>
                  {indicators.map((indicator) => (
                    <option key={indicator.id} value={indicator.name}>
                      {indicator.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Numerador</label>
                <input
                  type="number"
                  name="numerator"
                  value={form.numerator}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Denominador</label>
                <input
                  type="number"
                  name="denominator"
                  value={form.denominator}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Año</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Mes</label>
                <input
                  type="number"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Trimestre</label>
                <input
                  type="number"
                  name="quarter"
                  value={form.quarter}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600">Semestre</label>
                <input
                  type="number"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ResultComponent;
