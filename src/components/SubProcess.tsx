import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications';
import ConfirmationModal from './ConfirmationModal';

interface Process {
  id: number;
  name: string;
}

interface SubProcess {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string;
  author: string;
  status: boolean;
  creationDate: string;
  updateDate: string;
  process: number;
  user: number;
}

const SubProcessComponent: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [subProcessIdToDelete, setSubProcessIdToDelete] = useState<number | null>(null);
  const [subProcessToToggle, setSubProcessToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<SubProcess | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;

  const [form, setForm] = useState<Partial<SubProcess>>({
    name: '',
    description: '',
    code: '',
    version: '',
    author: '',
    status: true,
    process: 0,
  });

  useEffect(() => {
    const fetchSubProcesses = async () => {
      try {
        const response = await api.get('/subprocesses/');
        setSubProcesses(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching subprocesses:', err);
        setError('No se pudieron cargar los subprocesos');
        notifyError('No se pudieron cargar los subprocesos');
        setLoading(false);
      }
    };

    const fetchProcesses = async () => {
      try {
        const response = await api.get('/processes/');
        setProcesses(response.data);
      } catch (err: any) {
        console.error('Error fetching processes:', err);
        setError('No se pudieron cargar los procesos');
        notifyError('No se pudieron cargar los procesos');
      }
    };

    fetchSubProcesses();
    fetchProcesses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'status' ? value === 'true' : name === 'process' ? Number(value) : value,
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
        const response = await api.put(`/subprocesses/${form.id}/`, formData);
        setSubProcesses((prev) =>
          prev.map((sp) => (sp.id === response.data.id ? response.data : sp))
        );
        notifySuccess('Subproceso actualizado exitosamente');
      } else {
        const response = await api.post('/subprocesses/', formData);
        setSubProcesses((prev) => [...prev, response.data]);
        notifySuccess('Subproceso creado exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar el subproceso:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al crear o actualizar el subproceso';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (subProcess: SubProcess) => {
    setForm(subProcess);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (subProcess: SubProcess) => {
    setViewResult(subProcess);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setSubProcessIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subProcessIdToDelete) return;

    try {
      await api.delete(`/subprocesses/${subProcessIdToDelete}/`);
      setSubProcesses((prev) => prev.filter((subProcess) => subProcess.id !== subProcessIdToDelete));
      notifySuccess('Subproceso eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar el subproceso:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el subproceso';
      notifyError(errorMessage);
    } finally {
      setSubProcessIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setSubProcessToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!subProcessToToggle) return;

    try {
      const response = await api.patch(`/subprocesses/${subProcessToToggle.id}/`, {
        status: !subProcessToToggle.currentStatus,
      });
      setSubProcesses((prev) =>
        prev.map((subProcess) =>
          subProcess.id === subProcessToToggle.id ? { ...subProcess, status: response.data.status } : subProcess
        )
      );
      notifySuccess(`Subproceso ${subProcessToToggle.currentStatus ? 'inactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado del subproceso';
      notifyError(errorMessage);
    } finally {
      setSubProcessToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      code: '',
      version: '',
      author: '',
      status: true,
      process: 0,
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
        <h1 className="text-3xl font-bold mb-6">Sub Procesos</h1>

        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={openModal}
        >
          Agregar SubProceso
        </button>

        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} SubProceso</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre del SubProceso"
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
                      placeholder="Descripción del SubProceso"
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
                      placeholder="Código del SubProceso"
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
                      placeholder="Versión del SubProceso"
                      value={form.version || ''}
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
                      placeholder="Autor del SubProceso"
                      value={form.author || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="process" className="block text-sm font-medium text-gray-700">Proceso</label>
                    <select
                      name="process"
                      value={form.process || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value={0} disabled>Seleccionar proceso</option>
                      {processes.map((process) => (
                        <option key={process.id} value={process.id}>
                          {process.name}
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
                Detalles del Subproceso
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
                  <span className="font-medium">Autor:</span>
                  <span>{viewResult.author || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Estado:</span>
                  <span>{viewResult.status ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Proceso:</span>
                  <span>
                    {processes.find((process) => process.id === viewResult.process)?.name || 'N/A'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proceso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subProcesses.map((subProcess) => (
                <tr key={subProcess.id}>
                  <td className="px-6 py-4">{subProcess.id}</td>
                  <td className="px-6 py-4">{subProcess.name}</td>
                  <td className="px-6 py-4">{subProcess.description}</td>
                  <td className="px-6 py-4">{subProcess.code}</td>
                  <td className="px-6 py-4">{subProcess.version}</td>
                  <td className="px-6 py-4">{processes.find(p => p.id === subProcess.process)?.name}</td>
                  <td className="px-6 py-4">{subProcess.status ? 'Activo' : 'Inactivo'}</td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(subProcess)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(subProcess)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(subProcess.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={subProcess.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(subProcess.id, subProcess.status)}
                      title={subProcess.status ? 'Inactivar' : 'Activar'}
                    >
                      {subProcess.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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
          setSubProcessIdToDelete(null);
          setSubProcessToToggle(null);
        }}
        onConfirm={() => {
          if (subProcessIdToDelete) confirmDelete();
          if (subProcessToToggle) confirmToggleStatus();
        }}
        title="Confirmar Acción"
        message={
          subProcessIdToDelete
            ? '¿Estás seguro de que deseas eliminar este subproceso? Esta acción no se puede deshacer.'
            : subProcessToToggle
            ? `¿Estás seguro de que deseas ${subProcessToToggle.currentStatus ? 'inactivar' : 'activar'} este subproceso?`
            : '¿Estás seguro de que deseas realizar esta acción?'
        }
      />
    </Layout>
  );
};

export default SubProcessComponent;