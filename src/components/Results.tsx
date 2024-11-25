import React, { useEffect, useState } from "react";
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
  user: number;
  numerator: number;
  denominator: number;
  year: number;
  month: number;
  quarter: number;
  semester: number;
  calculationMethod: string;
}
interface ResultModalProps {
  onSave: (data: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ResultComponent: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [results, setResults] = useState<Result[]>([]);
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
    calculationMethod: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      ...form,
      user: 1, // Usuario fijo, ajustar según sea necesario.
    };

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
        calculationMethod: "",
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Resultados</h1>
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
              calculationMethod: "",
            });
          }}
        >
          Agregar Resultado
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar" : "Agregar"} Resultado</h2>
              <form onSubmit={handleSubmit}>
                {/* Formulario aquí */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setIsModalOpen(false)}
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

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
              {results.map((result) => (
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
    </Layout>
  );
};

export default ResultComponent;
