import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEdit, FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications';
import ConfirmationModal from './ConfirmationModal';

interface MacroProcess {
  id: number;
  name: string;
}

interface Process {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string;
  status: boolean;
  macroProcess: number;
  creationDate: string;
  updateDate: string;
  user: number;
}

const ProcessComponent: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [processIdToDelete, setProcessIdToDelete] = useState<number | null>(null);
  const [processToToggle, setProcessToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<Process | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;

  const [form, setForm] = useState<Partial<Process>>({
    name: '',
    description: '',
    code: '',
    version: '',
    status: true,
    macroProcess: 0,
  });

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await api.get('/processes/');
        setProcesses(response.data);
      } catch (err: any) {
        console.error('Error al obtener procesos:', err);
        setError('No se pudieron cargar los procesos');
        notifyError('No se pudieron cargar los procesos');
      } finally {
        setLoading(false);
      }
    };

    const fetchMacroProcesses = async () => {
      try {
        const response = await api.get('/macroprocesses/');
        setMacroProcesses(response.data);
      } catch (err: any) {
        console.error('Error al obtener macroprocesos:', err);
        setError('No se pudieron cargar los macroprocesos');
        notifyError('No se pudieron cargar los macroprocesos');
      }
    };

    fetchProcesses();
    fetchMacroProcesses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'status' ? value === 'true' : name === 'macroProcess' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      ...form,
      user: userId,
    };

    try {
      if (isEditing) {
        const response = await api.put(`/processes/${form.id}/`, formData);
        setProcesses((prev) =>
          prev.map((process) => (process.id === response.data.id ? response.data : process))
        );
        notifySuccess('Proceso actualizado exitosamente');
      } else {
        const response = await api.post('/processes/', formData);
        setProcesses((prev) => [...prev, response.data]);
        notifySuccess('Proceso creado exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar el proceso:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al guardar el proceso';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (process: Process) => {
    setForm(process);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (process: Process) => {
    setViewResult(process);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setProcessIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!processIdToDelete) return;

    try {
      await api.delete(`/processes/${processIdToDelete}/`);
      setProcesses((prev) => prev.filter((process) => process.id !== processIdToDelete));
      notifySuccess('Proceso eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar el proceso:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el proceso';
      notifyError(errorMessage);
    } finally {
      setProcessIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setProcessToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!processToToggle) return;

    try {
      const response = await api.patch(`/processes/${processToToggle.id}/`, {
        status: !processToToggle.currentStatus,
      });
      setProcesses((prev) =>
        prev.map((process) =>
          process.id === processToToggle.id ? { ...process, status: response.data.status } : process
        )
      );
      notifySuccess(`Proceso ${processToToggle.currentStatus ? 'inactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado del proceso';
      notifyError(errorMessage);
    } finally {
      setProcessToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      code: '',
      version: '',
      status: true,
      macroProcess: 0,
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
        <h1 className="text-3xl font-bold mb-6">Procesos</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={openModal}
        >
          Agregar Proceso
        </button>

        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} Proceso</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Proceso</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre"
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
                      placeholder="Descripción"
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
                      placeholder="Código"
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
                      placeholder="Versión"
                      value={form.version || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="macroProcess" className="block text-sm font-medium text-gray-700">MacroProceso</label>
                    <select
                      name="macroProcess"
                      value={form.macroProcess || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value={0} disabled>Seleccionar MacroProceso</option>
                      {macroProcesses.map((macro) => (
                        <option key={macro.id} value={macro.id}>
                          {macro.name}
                        </option>
                      ))}
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
                Detalles del Proceso
              </h2>

              {/* Contenido del modal */}
              <div className="space-y-4 text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Nombre:</span>
                  <span>{viewResult.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Descripción:</span>
                  <span>{viewResult.description || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Código:</span>
                  <span>{viewResult.code || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Versión:</span>
                  <span>{viewResult.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Estado:</span>
                  <span>{viewResult.status ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Macroproceso:</span>
                  <span>
                    {macroProcesses.find((macro) => macro.id === viewResult.macroProcess)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Fecha de Creación:</span>
                  <span>{viewResult.creationDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Fecha de Actualización:</span>
                  <span>{viewResult.updateDate || 'N/A'}</span>
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

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Versión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processes.map((process) => (
                <tr key={process.id}>
                  <td className="px-6 py-4">{process.id}</td>
                  <td className="px-6 py-4">{process.name}</td>
                  <td className="px-6 py-4">{process.description}</td>
                  <td className="px-6 py-4">{process.code}</td>
                  <td className="px-6 py-4">{process.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.status ? 'Activo' : 'Inactivo'}</td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(process)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(process)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(process.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={process.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(process.id, process.status)}
                      title={process.status ? 'Inactivar' : 'Activar'}
                    >
                      {process.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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
          setProcessIdToDelete(null);
          setProcessToToggle(null);
        }}
        onConfirm={() => {
          if (processIdToDelete) confirmDelete();
          if (processToToggle) confirmToggleStatus();
        }}
        title="Confirmar Acción"
        message={
          processIdToDelete
            ? '¿Estás seguro de que deseas eliminar este proceso? Esta acción no se puede deshacer.'
            : processToToggle
            ? `¿Estás seguro de que deseas ${processToToggle.currentStatus ? 'inactivar' : 'activar'} este proceso?`
            : '¿Estás seguro de que deseas realizar esta acción?'
        }
      />
    </Layout>
  );
};

export default ProcessComponent;