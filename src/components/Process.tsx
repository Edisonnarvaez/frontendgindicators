import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';

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
      user: 1,
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Proceso</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
              <label htmlFor="habilitationCode" className="block text-sm font-medium">Nombre del Proceso</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={form.name || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="habilitationCode" className="block text-sm font-medium">Descripción</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Descripción"
                  value={form.description || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="habilitationCode" className="block text-sm font-medium">Código</label>
                <input
                  type="text"
                  name="code"
                  placeholder="Código"
                  value={form.code || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="habilitationCode" className="block text-sm font-medium">Versión</label>
                <input
                  type="text"
                  name="version"
                  placeholder="Versión"
                  value={form.version || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
              <label htmlFor="macroProcess" className="block text-sm font-medium">MacroProceso</label>
                <select
                  name="macroProcess"
                  value={form.macroProcess || 0}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
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
                <label htmlFor="status" className="block text-sm font-medium">Estado</label>
                <select
                  name="status"
                  value={form.status ? 'true' : 'false'}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
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
