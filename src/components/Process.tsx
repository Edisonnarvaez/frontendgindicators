import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
  const [processes, setProcesses] = useState<Process[]>([]);
  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Processes');
      } finally {
        setLoading(false);
      }
    };

    const fetchMacroProcesses = async () => {
      try {
        const response = await api.get('/macroprocesses/');
        setMacroProcesses(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch MacroProcesses');
      }
    };

    fetchProcesses();
    fetchMacroProcesses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === 'status' ? value === 'true' : value,
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
        alert('Proceso actualizado exitosamente');
      } else {
        const response = await api.post('/processes/', formData);
        setProcesses((prev) => [...prev, response.data]);
        alert('Proceso creado exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar el proceso', error);
      alert('Error al guardar el proceso');
    }
  };

  const handleEdit = (process: Process) => {
    setForm(process);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este proceso?')) return;

    try {
      await api.delete(`/processes/${id}/`);
      setProcesses((prev) => prev.filter((process) => process.id !== id));
      alert('Proceso eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el proceso', error);
      alert('Error al eliminar el proceso');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/processes/${id}/`, {
        status: !currentStatus,
      });
      setProcesses((prev) =>
        prev.map((process) =>
          process.id === id ? { ...process, status: response.data.status } : process
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado', error);
      alert('Error al cambiar el estado del proceso');
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

  if (loading) return <Layout><div>Loading...</div></Layout>;
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
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(process)}>
                      Editar
                    </button>
                    <button className="ml-4 text-red-600 hover:text-red-800" onClick={() => handleDelete(process.id)}>
                      Eliminar
                    </button>
                    <button
                      className={`ml-4 ${process.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                      onClick={() => handleToggleStatus(process.id, process.status)}
                    >
                      {process.status ? 'Inactivar' : 'Activar'}
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

export default ProcessComponent;
