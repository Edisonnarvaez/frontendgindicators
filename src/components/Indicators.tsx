import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEdit, FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications'; 
import ConfirmationModal from './ConfirmationModal';

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
  const { notifySuccess, notifyError } = useNotifications();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [indicatorIdToDelete, setIndicatorIdToDelete] = useState<number | null>(null);
  const [indicatorToToggle, setIndicatorToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;

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
        const response = await api.get('/indicators/');
        setIndicators(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching indicators:', err);
        setError('No se pudieron cargar los indicadores');
        notifyError('No se pudieron cargar los indicadores');
        setLoading(false);
      }
    };

    const fetchSubProcesses = async () => {
      try {
        const response = await api.get('/subprocesses/');
        setSubProcesses(response.data);
      } catch (err: any) {
        console.error('Error fetching subprocesses:', err);
        setError('No se pudieron cargar los subprocesos');
        notifyError('No se pudieron cargar los subprocesos');
      }
    };

    fetchSubProcesses();
    fetchIndicators();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'status' ? value === 'true' : name === 'subProcess' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      ...form,
      user: userId,
    };
    console.log('Datos enviados al backend:', formData);

    try {
      if (isEditing) {
        const response = await api.put(`/indicators/${form.id}/`, formData);
        setIndicators((prev) =>
          prev.map((indicator) => (indicator.id === response.data.id ? response.data : indicator))
        );
        notifySuccess('Indicador actualizado exitosamente');
      } else {
        const response = await api.post('/indicators/', formData);
        setIndicators((prev) => [...prev, response.data]);
        notifySuccess('Indicador creado exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar el indicador:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al crear o actualizar el indicador';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setForm(indicator);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (indicator: Indicator) => {
    notifyError('Función de visualización no implementada');
  };

  const handleDelete = (id: number) => {
    setIndicatorIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!indicatorIdToDelete) return;

    try {
      await api.delete(`/indicators/${indicatorIdToDelete}/`);
      setIndicators((prev) => prev.filter((indicator) => indicator.id !== indicatorIdToDelete));
      notifySuccess('Indicador eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar el indicador:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el indicador';
      notifyError(errorMessage);
    } finally {
      setIndicatorIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setIndicatorToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!indicatorToToggle) return;

    try {
      const response = await api.patch(`/indicators/${indicatorToToggle.id}/`, {
        status: !indicatorToToggle.currentStatus,
      });
      setIndicators((prev) =>
        prev.map((indicator) =>
          indicator.id === indicatorToToggle.id ? { ...indicator, status: response.data.status } : indicator
        )
      );
      notifySuccess(`Indicador ${indicatorToToggle.currentStatus ? 'inactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado del indicador';
      notifyError(errorMessage);
    } finally {
      setIndicatorToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
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
    setIsModalOpen(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div>Cargando...</div></Layout>;
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
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-5xl mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} Indicador</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre del indicador"
                      value={form.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <input
                      type="text"
                      name="description"
                      placeholder="Descripción del indicador"
                      value={form.description || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código</label>
                    <input
                      type="text"
                      name="code"
                      placeholder="Código del indicador"
                      value={form.code || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700">Versión</label>
                    <input
                      type="text"
                      name="version"
                      placeholder="Versión del indicador"
                      value={form.version || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="calculationMethod" className="block text-sm font-medium text-gray-700">Método de cálculo</label>
                    <select
                      name="calculationMethod"
                      value={form.calculationMethod || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    <label htmlFor="measurementUnit" className="block text-sm font-medium text-gray-700">Unidad de medida</label>
                    <input
                      type="text"
                      name="measurementUnit"
                      placeholder="Unidad de medida del indicador"
                      value={form.measurementUnit || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numerator" className="block text-sm font-medium text-gray-700">Numerador</label>
                    <input
                      type="text"
                      name="numerator"
                      placeholder="Numerador del indicador"
                      value={form.numerator || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numeratorResponsible" className="block text-sm font-medium text-gray-700">Responsable del numerador</label>
                    <input
                      type="text"
                      name="numeratorResponsible"
                      placeholder="Responsable del numerador"
                      value={form.numeratorResponsible || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numeratorSource" className="block text-sm font-medium text-gray-700">Fuente del numerador</label>
                    <input
                      type="text"
                      name="numeratorSource"
                      placeholder="Fuente del numerador"
                      value={form.numeratorSource || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="numeratorDescription" className="block text-sm font-medium text-gray-700">Descripción del numerador</label>
                    <input
                      type="text"
                      name="numeratorDescription"
                      placeholder="Descripción del numerador"
                      value={form.numeratorDescription || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominator" className="block text-sm font-medium text-gray-700">Denominador</label>
                    <input
                      type="text"
                      name="denominator"
                      placeholder="Denominador del indicador"
                      value={form.denominator || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominatorResponsible" className="block text-sm font-medium text-gray-700">Responsable del denominador</label>
                    <input
                      type="text"
                      name="denominatorResponsible"
                      placeholder="Responsable del denominador"
                      value={form.denominatorResponsible || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominatorSource" className="block text-sm font-medium text-gray-700">Fuente del denominador</label>
                    <input
                      type="text"
                      name="denominatorSource"
                      placeholder="Fuente del denominador"
                      value={form.denominatorSource || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="denominatorDescription" className="block text-sm font-medium text-gray-700">Descripción del denominador</label>
                    <input
                      type="text"
                      name="denominatorDescription"
                      placeholder="Descripción del denominador"
                      value={form.denominatorDescription || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="target" className="block text-sm font-medium text-gray-700">Meta</label>
                    <input
                      type="text"
                      name="target"
                      placeholder="Meta del indicador"
                      value={form.target || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">Autor</label>
                    <input
                      type="text"
                      name="author"
                      placeholder="Autor del indicador"
                      value={form.author || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subprocess" className="block text-sm font-medium">SubProceso</label>
                    <select
                      name="subProcess"
                      value={form.subProcess || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    <label htmlFor="measurementFrequency" className="block text-sm font-medium text-gray-700">Frecuencia de medición</label>
                    <select
                      name="measurementFrequency"
                      value={form.measurementFrequency || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      name="status"
                      value={form.status ? 'true' : 'false'}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-center sm:justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numerador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denominador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad de medida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subproceso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicators.map((indicator) => (
                <tr key={indicator.id}>
                  <td className="px-6 py-4">{indicator.id}</td>
                  <td className="px-6 py-4">{indicator.name}</td>
                  <td className="px-6 py-4">{indicator.code}</td>
                  <td className="px-6 py-4">{indicator.description}</td>
                  <td className="px-6 py-4">{indicator.numerator}</td>
                  <td className="px-6 py-4">{indicator.denominator}</td>
                  <td className="px-6 py-4">{indicator.target}</td>
                  <td className="px-6 py-4">{indicator.measurementUnit}</td>
                  <td className="px-6 py-4">{subProcesses.find(sp => sp.id === indicator.subProcess)?.name}</td>
                  <td className="px-6 py-4">{indicator.status ? 'Activo' : 'Inactivo'}</td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(indicator)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(indicator)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(indicator.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={indicator.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(indicator.id, indicator.status)}
                      title={indicator.status ? 'Inactivar' : 'Activar'}
                    >
                      {indicator.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setIndicatorIdToDelete(null);
            setIndicatorToToggle(null);
          }}
          onConfirm={() => {
            if (indicatorIdToDelete) confirmDelete();
            if (indicatorToToggle) confirmToggleStatus();
          }}
          title="Confirmar Acción"
          message={
            indicatorIdToDelete
              ? '¿Estás seguro de que deseas eliminar este indicador? Esta acción no se puede deshacer.'
              : indicatorToToggle
              ? `¿Estás seguro de que deseas ${indicatorToToggle.currentStatus ? 'inactivar' : 'activar'} este indicador?`
              : '¿Estás seguro de que deseas realizar esta acción?'
          }
        />
    </Layout>
  );
};

export default IndicatorComponent;
