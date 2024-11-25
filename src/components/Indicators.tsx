import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface SubProcess {
  id: number;
  name: string;
}

interface Indicator {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string;
  calculationMethod: string;
  measurementUnit: string;
  numerator: string;
  numeratorResponsible: string;
  numeratorSource: string;
  numeratorDescription: string;
  denominator: string;
  denominatorResponsible: string;
  denominatorSource: string;
  denominatorDescription: string;
  target: string;
  author: string;
  subProcess: number;
  measurementFrequency: string;
  status: boolean;
  user: number;
}

const IndicatorComponent: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<Partial<Indicator>>({
    name: '',
    description: '',
    code: '',
    version: '',
    calculationMethod: '',
    measurementUnit: '',
    numerator: '',
    numeratorResponsible: '',
    numeratorSource: '',
    numeratorDescription: '',
    denominator: '',
    denominatorResponsible: '',
    denominatorSource: '',
    denominatorDescription: '',
    target: '',
    author: '',
    subProcess: 0,
    measurementFrequency: '',
    status: true,
    
  });

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/indicators/');
        setIndicators(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch indicador');
        setLoading(false);
      }
    };

    const fetchSubProcesses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/subprocesses/');
        setSubProcesses(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Indicators');
      }
    };

    fetchSubProcesses();
    fetchIndicators();
  }, []);
    

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'status' ? value === 'true' : value,
    }));
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value === 'true', 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      ...form,
      user: 1, // Usuario fijo, ajusta según sea necesario.
    };
    //quiero imprimir lo que se estan enviando al backend
    console.log(formData);

    try {
      if (isEditing) {
        const response = await axios.put(
          `http://localhost:8000/api/indicators/${form.id}/`,
          formData
        );
        alert('Indicador actualizado exitosamente');
        setIndicators((prev) =>
          prev.map((sp) => (sp.id === response.data.id ? response.data : sp))
        );
      } else {
        const response = await axios.post('http://localhost:8000/api/indicators/', formData);
        alert('Indicador creado exitosamente');
        setIndicators((prev) => [...prev, response.data]);
      }

      setIsModalOpen(false);
      setForm({
        name: '',
        description: '',
        code: '',
        version: '',
        calculationMethod: '',
        measurementUnit: '',
        numerator: '',
        numeratorResponsible: '',
        numeratorSource: '',
        numeratorDescription: '',
        denominator: '',
        denominatorResponsible: '',
        denominatorSource: '',
        denominatorDescription: '',
        target: '',
        author: '',
        subProcess: 0,
        measurementFrequency: '',
        status: true,
        
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los datos', error);
      alert('Error al crear o actualizar el Indicador');
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setForm(indicator);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este indicador?'))  return;
      try {
        await axios.delete(`http://localhost:8000/api/indicators/${id}/`);
        setIndicators((prev) => prev.filter((indicator) => indicator.id !== id));
        alert('Indicador eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting indicator', error);
        alert('Error al eliminar el indicador');
      }
    };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/indicators/${id}/`, {
        status: !currentStatus,
      });
      setIndicators((prev) =>
        prev.map((indicator) =>
          indicator.id === id ? { ...indicator, status: response.data.status } : indicator
        )
      );
    } catch (error) {
      console.error('Error toggling status', error);
      alert('Error al cambiar el estado');
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Indicadores</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={() => {
            setIsModalOpen(true);
            setForm({
              name: '',
              description: '',
              code: '',
              version: '',
              calculationMethod: '',
              measurementUnit: '',
              numerator: '',
              numeratorResponsible: '',
              numeratorSource: '',
              numeratorDescription: '',
              denominator: '',
              denominatorResponsible: '',
              denominatorSource: '',
              denominatorDescription: '',
              target: '',
              author: '',
              subProcess: 0,
              measurementFrequency: '',
              status: true,
              
            });
            setIsEditing(false);
          }}
        >
          Agregar Indicador
        </button>

        {isModalOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Indicador</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium">Descripción</label>
                    <input
                      type="text"
                      name="description"
                      value={form.description || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium">Código</label>
                    <input
                      type="text"
                      name="code"
                      value={form.code || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium">Versión</label>
                    <input
                      type="text"
                      name="version"
                      value={form.version || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="calculationMethod" className="block text-sm font-medium">Método de cálculo</label>
                    <select
                      name="calculationMethod"
                      value={form.calculationMethod || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    >
                      <option value="" disabled>Seleccionar método</option>
                      <option value="percentage">Porcentaje</option>
                      <option value="rate_per_1000">Tasa por 1000</option>
                      <option value="rate_per_10000">Tasa por 10000</option>
                      <option value="average">Promedio</option>
                      <option value="ratio">Razón</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="measurementUnit" className="block text-sm font-medium">Unidad de medida</label>
                    <input
                      type="text"
                      name="measurementUnit"
                      value={form.measurementUnit || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numerator" className="block text-sm font-medium">Numerador</label>
                    <input
                      type="text"
                      name="numerator"
                      value={form.numerator || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numeratorResponsible" className="block text-sm font-medium">Responsable del numerador</label>
                    <input
                      type="text"
                      name="numeratorResponsible"
                      value={form.numeratorResponsible || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numeratorSource" className="block text-sm font-medium">Fuente del numerador</label>
                    <input
                      type="text"
                      name="numeratorSource"
                      value={form.numeratorSource || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numeratorDescription" className="block text-sm font-medium">Descripción del numerador</label>
                    <input
                      type="text"
                      name="numeratorDescription"
                      value={form.numeratorDescription || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominator" className="block text-sm font-medium">Denominador</label>
                    <input
                      type="text"
                      name="denominator"
                      value={form.denominator || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominatorResponsible" className="block text-sm font-medium">Responsable del denominador</label>
                    <input
                      type="text"
                      name="denominatorResponsible"
                      value={form.denominatorResponsible || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominatorSource" className="block text-sm font-medium">Fuente del denominador</label>
                    <input
                      type="text"
                      name="denominatorSource"
                      value={form.denominatorSource || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominatorDescription" className="block text-sm font-medium">Descripción del denominador</label>
                    <input
                      type="text"
                      name="denominatorDescription"
                      value={form.denominatorDescription || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="target" className="block text-sm font-medium">Meta</label>
                    <input
                      type="text"
                      name="target"
                      value={form.target || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium">Autor</label>
                    <input
                      type="text"
                      name="author"
                      value={form.author || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subprocess" className="block text-sm font-medium">SubProceso</label>
                    <select
                      name="subProcess"
                      value={form.subProcess || 0}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    >
                      <option value={0} disabled>Seleccionar subproceso</option>
                      {subProcesses.map((subProcess) => (
                        <option key={subProcess.id} value={subProcess.id}>
                          {subProcess.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="measurementFrequency" className="block text-sm font-medium">Frecuencia de medición</label>
                    <select                      
                      name="measurementFrequency"
                      value={form.measurementFrequency || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    >
                      <option value="" disabled>Seleccionar Frecuencia de medición</option>
                      <option value="monthly">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="semiannual">Semestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium">Estado</label>
                    <select
                      name="status"
                      value={form.status ? 'true' : 'false'}
                      onChange={handleSelectChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>                  
                  <div className="flex justify-end space-x-2">
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
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>            
            <tbody className="bg-white divide-y divide-gray-200">
              {indicators.map((indicator) => (
                <tr key={indicator.id}>
                  <td className="px-6 py-4">{indicator.id}</td>
                  <td className="px-6 py-4">{indicator.name}</td>
                  <td className="px-6 py-4">{indicator.description}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(indicator)}>
                      Editar
                    </button>
                    <button className="ml-4 text-red-600 hover:text-red-800" onClick={() => handleDelete(indicator.id)}>
                      Eliminar
                    </button>
                    <button
                      className={`ml-4 ${indicator.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                      onClick={() => handleToggleStatus(indicator.id, indicator.status)}
                    >
                      {indicator.status ? 'Inactivar' : 'Activar'}
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

export default IndicatorComponent;
