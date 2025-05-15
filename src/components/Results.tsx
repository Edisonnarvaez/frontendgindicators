import React, { useState, useEffect, Component, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaEye, FaSyncAlt } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications'; // Ajusta la ruta
import ConfirmationModal from './ConfirmationModal'; // Ajusta la ruta
import api from '../api'; // Ajusta la ruta
import Layout from './Layout'; // Ajusta la ruta
import type { RootState } from '../store'; // Ajusta la ruta según tu configuración de Redux

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
  calculatedValue: number | null | undefined;
  year: number;
  month: number;
  quarter: number;
  semester: number;
  user?: number;
}

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(_: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          <h2>Algo salió mal.</h2>
          <p>Por favor, recarga la página o intenta de nuevo.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const ResultComponent: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [form, setForm] = useState<Partial<Result>>({
    headquarters: 0,
    indicator: 0,
    numerator: 0,
    denominator: 0,
    calculatedValue: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    semester: new Date().getMonth() + 1 <= 6 ? 1 : 2,
    //quarter: 0,
    //semester: 0,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Result, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);
  const [headquartersFilter, setHeadquartersFilter] = useState<string>('');
  const [indicatorFilter, setIndicatorFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [resultIdToDelete, setResultIdToDelete] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<Result | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, indicatorsRes, headquartersRes] = await Promise.all([
          api.get('/results/'),
          api.get('/indicators/'),
          api.get('/headquarters/'),
        ]);

        setResults(resultsRes.data);
        setIndicators(indicatorsRes.data);
        setHeadquarters(headquartersRes.data);
        setFilteredResults(resultsRes.data);
        setLoading(false);
        //console.log('Resultados:', resultsRes.data);
        //console.log('Indicadores:', indicatorsRes.data);
        //console.log('Sedes:', headquartersRes.data);
      } catch (err: any) {
        console.error('Error al obtener datos:', err);
        setError('No se pudieron cargar los datos');
        notifyError('No se pudieron cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = results.filter(
      (result) =>
        (headquartersFilter ? result.headquarters === Number(headquartersFilter) : true) &&
        (indicatorFilter ? result.indicator === Number(indicatorFilter) : true)
    );
    setFilteredResults(filtered);
    //console.log('Resultados filtrados:', filtered);
  }, [results, headquartersFilter, indicatorFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const resultsRes = await api.get('/results/');
      setResults(resultsRes.data);
      setFilteredResults(
        resultsRes.data.filter(
          (result: Result) =>
            (headquartersFilter ? result.headquarters === Number(headquartersFilter) : true) &&
            (indicatorFilter ? result.indicator === Number(indicatorFilter) : true)
        )
      );
      notifySuccess('Tabla de resultados actualizada');
      //console.log('Resultados recargados:', resultsRes.data);
    } catch (err: any) {
      console.error('Error al recargar resultados:', err);
      notifyError('Error al recargar los resultados');
    } finally {
      setIsRefreshing(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Result, string>> = {};
    if (!form.headquarters || form.headquarters === 0) {
      errors.headquarters = 'Debe seleccionar una sede';
    }
    if (!form.indicator || form.indicator === 0) {
      errors.indicator = 'Debe seleccionar un indicador';
    }
    if (form.numerator === undefined || form.numerator < 0) {
      errors.numerator = 'El numerador debe ser un número no negativo';
    }
    if (form.denominator === undefined || form.denominator < 0) {
      errors.denominator = 'El denominador debe ser un número no negativo';
    }
    if (form.calculatedValue === undefined || form.calculatedValue === null || form.calculatedValue < 0) {
      errors.calculatedValue = 'El valor calculado debe ser un número no negativo';
    }
    if (form.year === undefined || form.year < 1900 || form.year > new Date().getFullYear() + 1) {
      errors.year = 'El año debe ser válido';
    }
    if (form.month === undefined || form.month < 1 || form.month > 12) {
      errors.month = 'El mes debe estar entre 1 y 12';
    }
    if (form.quarter === undefined || form.quarter < 1 || form.quarter > 4) {
      errors.quarter = 'El trimestre debe estar entre 1 y 4';
    }
    if (form.semester === undefined || form.semester < 1 || form.semester > 2) {
      errors.semester = 'El semestre debe ser 1 o 2';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === 'headquarters' ||
          name === 'indicator' ||
          name === 'numerator' ||
          name === 'denominator' ||
          name === 'calculatedValue' ||
          name === 'year' ||
          name === 'month' ||
          name === 'quarter' ||
          name === 'semester'
          ? Number(value)
          : value,
    });
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      notifyError('Por favor, corrige los errores en el formulario');
      return;
    }

    const formData = { ...form, user: userId };
    //console.log('Datos enviados al backend:', formData);

    try {
      let newResult: Result;
      if (isEditing && form.id) {
        const response = await api.put(`/results/${form.id}/`, formData);
        newResult = {
          ...response.data,
          calculatedValue: response.data.calculatedValue ?? 0,
        };
        setResults((prev) =>
          prev.map((result) => (result.id === newResult.id ? newResult : result))
        );
        notifySuccess('Metrica actualizada exitosamente');
      } else {
        const response = await api.post('/results/', formData);
        newResult = {
          ...response.data,
          calculatedValue: response.data.calculatedValue ?? 0,
        };
        setResults((prev) => [...prev, newResult]);
        notifySuccess('Metricas añadidas exitosamente');
      }
      setFilteredResults((prev) =>
        [newResult, ...prev.filter((r) => r.id !== newResult.id)].filter(
          (result) =>
            (headquartersFilter ? result.headquarters === Number(headquartersFilter) : true) &&
            (indicatorFilter ? result.indicator === Number(indicatorFilter) : true)
        )
      );
      //console.log('Nuevo resultado:', newResult);
      //console.log('Resultados actualizados:', results);
      //console.log('Resultados filtrados actualizados:', filteredResults);
      resetForm();
    } catch (err: any) {
      console.error('Error al guardar el resultado:', err);
      const errorMessage =
        err.response?.data?.message || 'Error al guardar la metrica';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (result: Result) => {
    setForm(result);
    setIsEditing(true);
    setFormVisible(true);
  };

  const handleView = (result: Result) => {
    setViewResult(result);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setResultIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!resultIdToDelete) return;

    try {
      await api.delete(`/results/${resultIdToDelete}/`);
      setResults((prev) => prev.filter((r) => r.id !== resultIdToDelete));
      setFilteredResults((prev) => prev.filter((r) => r.id !== resultIdToDelete));
      notifySuccess('Registro eliminado exitosamente');
    } catch (err: any) {
      console.error('Error al eliminar el registro:', err);
      const errorMessage =
        err.response?.data?.message || 'Error al eliminar el registro';
      notifyError(errorMessage);
    } finally {
      setResultIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
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
    setFormErrors({});
    setIsEditing(false);
    setFormVisible(false);
  };

  const resetFilters = () => {
    setHeadquartersFilter('');
    setIndicatorFilter('');
  };

  const toggleFormVisibility = () => {
    setFormVisible((prev) => !prev);
    if (isFormVisible) resetForm();
  };

  const formatNumber = (value: number | null | undefined): string => {
    return value != null && !isNaN(value) ? value.toFixed(2) : '0.00';
  };

  if (loading) return <Layout><div>Cargando...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <ErrorBoundary>
      <Layout>
        {/* Formulario */}
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-6">Resultados de Indicadores</h1>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <div className="container mx-auto p-4"></div>
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
              <button
                onClick={() => {
                  setFormVisible((prev) => !prev);
                  if (isFormVisible) resetForm();
                }}
                className="mb-2 sm:mb-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isFormVisible ? 'Ocultar Formulario' : 'Agregar Metrica'}
              </button>
            </div>

            {isFormVisible && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  {isEditing ? "Editar Metrica" : "Agregar Nueva Metrica"}
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
                    {formErrors.headquarters && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.headquarters}</p>
                    )}
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
                    {formErrors.indicator && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.indicator}</p>
                    )}
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
                    {formErrors.numerator && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.numerator}</p>
                    )}
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
                    {formErrors.denominator && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.denominator}</p>
                    )}
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
                    {formErrors.year && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.year}</p>
                    )}
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
                    {formErrors.month && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.month}</p>
                    )}
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
                    {formErrors.quarter && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.quarter}</p>
                    )}
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
                    {formErrors.semester && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          headquarters: 0,
                          indicator: 0,
                          numerator: 0,
                          denominator: 0,
                          //calculatedValue: 0,
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

          {/* Filtros */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4"> </h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              <div>
                <label htmlFor="headquartersFilter" className="block text-sm font-medium text-gray-700">
                  Filtrar por Sede
                </label>
                <select
                  name="headquartersFilter"
                  value={headquartersFilter}
                  onChange={(e) => setHeadquartersFilter(e.target.value)}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Filtrar por sede"
                >
                  <option value="">Todas las sedes</option>
                  {headquarters.map((hq) => (
                    <option key={hq.id} value={hq.id}>
                      {hq.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="indicatorFilter" className="block text-sm font-medium text-gray-700">
                  Filtrar por Indicador
                </label>
                <select
                  name="indicatorFilter"
                  value={indicatorFilter}
                  onChange={(e) => setIndicatorFilter(e.target.value)}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Filtrar por indicador"
                >
                  <option value="">Todos los indicadores</option>
                  {indicators.map((indicator) => (
                    <option key={indicator.id} value={indicator.id}>
                      {indicator.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 items-end ">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 w-full sm:w-auto"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  title="Actualizar tabla"
                  aria-label="Actualizar tabla de resultados"
                >
                  <FaSyncAlt className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {filteredResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No hay resultados disponibles</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sede
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numerador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Denominador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resultado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {headquarters.find((hq) => hq.id === result.headquarters)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indicators.find((ind) => ind.id === result.indicator)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.numerator}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.denominator}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(result.calculatedValue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(result)}
                          title="Editar"
                          aria-label="Editar resultado"
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleView(result)}
                          title="Ver"
                          aria-label="Ver resultado"
                        >
                          <FaEye size={20} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => result.id && handleDelete(result.id)}
                          title="Eliminar"
                          aria-label="Eliminar resultado"
                        >
                          <FaTrash size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal de visualización */}
          {isViewModalOpen && viewResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-opacity duration-300 ease-out">
              <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8 transform transition-all duration-300 scale-100 hover:scale-[1.01]">
                {/* Botón de cerrar en la esquina superior derecha */}
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setIsViewModalOpen(false)}
                  aria-label="Cerrar modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Título del modal */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center tracking-tight">
                  Detalles del Resultado
                </h2>

                {/* Contenido del modal */}
                <div className="space-y-4 text-gray-700">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Sede:</span>
                    <span>
                      {headquarters.find((hq) => hq.id === viewResult.headquarters)?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Indicador:</span>
                    <span>
                      {indicators.find((ind) => ind.id === viewResult.indicator)?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Numerador:</span>
                    <span>{viewResult.numerator}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Denominador:</span>
                    <span>{viewResult.denominator}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Valor Calculado:</span>
                    <span>{formatNumber(viewResult.calculatedValue)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Año:</span>
                    <span>{viewResult.year}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Mes:</span>
                    <span>{viewResult.month}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Trimestre:</span>
                    <span>{viewResult.quarter}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Semestre:</span>
                    <span>{viewResult.semester}</span>
                  </div>
                </div>

                {/* Botón de cerrar en el footer */}
                <div className="mt-8 flex justify-center">
                  <button
                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => {
              setIsConfirmModalOpen(false);
              setResultIdToDelete(null);
            }}
            onConfirm={confirmDelete}
            title="Confirmar Acción"
            message="¿Estás seguro de que deseas eliminar este resultado? Esta acción no se puede deshacer."
          />
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default ResultComponent;