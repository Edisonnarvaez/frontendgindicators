import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications'; 
import ConfirmationModal from './ConfirmationModal';

interface Department {
  id: number;
  name: string;
}

interface MacroProcess {
  id: number;
  name: string;
  description: string;
  department: number;
  code: string;
  version: string;
  status: boolean;
  creationDate: string;
  updateDate: string;
  user: number;
}

const MacroProcessComponent: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [macroProcessIdToDelete, setMacroProcessIdToDelete] = useState<number | null>(null);
  const [macroProcessToToggle, setMacroProcessToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);

  const [form, setForm] = useState<Partial<MacroProcess>>({
    name: '',
    description: '',
    department: 0,
    code: '',
    version: '',
    status: true,
  });

  useEffect(() => {
    const fetchMacroProcesses = async () => {
      try {
        const response = await api.get('/macroprocesses/');
        setMacroProcesses(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching macroprocesses:', err);
        setError('No se pudieron cargar los macroprocesos');
        notifyError('No se pudieron cargar los macroprocesos');
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
      } catch (err: any) {
        console.error('Error fetching departments:', err);
        setError('No se pudieron cargar las áreas');
        notifyError('No se pudieron cargar las áreas');
      }
    };

    fetchMacroProcesses();
    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'status' ? value === 'true' : name === 'department' ? Number(value) : value,
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
        const response = await api.put(`/macroprocesses/${form.id}/`, formData);
        setMacroProcesses((prev) =>
          prev.map((mp) => (mp.id === response.data.id ? response.data : mp))
        );
        notifySuccess('Macroproceso actualizado exitosamente');
      } else {
        const response = await api.post('/macroprocesses/', formData);
        setMacroProcesses((prev) => [...prev, response.data]);
        notifySuccess('Macroproceso creado exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar el macroproceso:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al crear o actualizar el macroproceso';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (macroProcess: MacroProcess) => {
    setForm(macroProcess);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (macroProcess: MacroProcess) => {
    notifyError('Función de visualización no implementada');
  };

  const handleDelete = (id: number) => {
    setMacroProcessIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!macroProcessIdToDelete) return;

    try {
      await api.delete(`/macroprocesses/${macroProcessIdToDelete}/`);
      setMacroProcesses((prev) => prev.filter((macroProcess) => macroProcess.id !== macroProcessIdToDelete));
      notifySuccess('Macroproceso eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar el macroproceso:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el macroproceso';
      notifyError(errorMessage);
    } finally {
      setMacroProcessIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setMacroProcessToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!macroProcessToToggle) return;

    try {
      const response = await api.patch(`/macroprocesses/${macroProcessToToggle.id}/`, {
        status: !macroProcessToToggle.currentStatus,
      });
      setMacroProcesses((prev) =>
        prev.map((macroProcess) =>
          macroProcess.id === macroProcessToToggle.id ? { ...macroProcess, status: response.data.status } : macroProcess
        )
      );
      notifySuccess(`Macroproceso ${macroProcessToToggle.currentStatus ? 'inactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado del macroproceso';
      notifyError(errorMessage);
    } finally {
      setMacroProcessToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      department: 0,
      code: '',
      version: '',
      status: true,
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div>Cargando...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Macro Procesos</h1>

        {/* Botón para abrir el modal para agregar un nuevo macroproceso */}
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={handleOpenModal}  // Usamos la función `handleOpenModal`
        >
          Agregar MacroProceso
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} MacroProceso</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre del macroproceso"
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
                      placeholder="Descripción del macroproceso"
                      value={form.description || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                    <select
                      name="department"
                      value={form.department || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0} disabled>Seleccionar área</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código</label>
                    <input
                      type="text"
                      name="code"
                      placeholder="Código del macroproceso"
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
                      placeholder="Versión del macroproceso"
                      value={form.version || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
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

        {/* Tabla de macroprocesos */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {macroProcesses.map((macroProcess) => (
                <tr key={macroProcess.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{macroProcess.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{macroProcess.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{macroProcess.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {departments.find(dept => dept.id === macroProcess.department)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{macroProcess.code}</td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(macroProcess)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(macroProcess)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(macroProcess.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={macroProcess.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(macroProcess.id, macroProcess.status)}
                      title={macroProcess.status ? 'Inactivar' : 'Activar'}
                    >
                      {macroProcess.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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
            setMacroProcessIdToDelete(null);
            setMacroProcessToToggle(null);
          }}
          onConfirm={() => {
            if (macroProcessIdToDelete) confirmDelete();
            if (macroProcessToToggle) confirmToggleStatus();
          }}
          title="Confirmar Acción"
          message={
            macroProcessIdToDelete
              ? '¿Estás seguro de que deseas eliminar este macroproceso? Esta acción no se puede deshacer.'
              : macroProcessToToggle
              ? `¿Estás seguro de que deseas ${macroProcessToToggle.currentStatus ? 'inactivar' : 'activar'} este macroproceso?`
              : '¿Estás seguro de que deseas realizar esta acción?'
          }
        />
    </Layout>
  );
};

export default MacroProcessComponent;