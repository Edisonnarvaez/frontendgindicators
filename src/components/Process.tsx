import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface Process {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string;
  status: boolean;
  creationDate: string;
  updateDate: string;
  macroProcess: { name: string };
  user: { name: string };
}

const Process: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProcess, setNewProcess] = useState<Process>({
    id: 0,
    name: '',
    description: '',
    code: '',
    version: '',
    status: true,
    creationDate: '',
    updateDate: '',
    macroProcess: { name: '' },
    user: { name: '' },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Partial<Process>>({});

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/processes/');
      setProcesses(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch Processes');
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/processes/', newProcess);
      setNewProcess({
        id: 0,
        name: '',
        description: '',
        code: '',
        version: '',
        status: true,
        creationDate: '',
        updateDate: '',
        macroProcess: { name: '' },
        user: { name: '' },
      });
      fetchProcesses();
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to create process');
    }
  };

  const handleUpdate = async (id: number, updatedProcess: Partial<Process>) => {
    try {
      await axios.put(`http://localhost:8000/api/processes/${id}/`, updatedProcess);
      fetchProcesses();
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to update process');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/processes/${id}/`);
      fetchProcesses();
    } catch (err) {
      setError('Failed to delete process');
    }
  };

  const handleOpenModal = (process?: Process) => {
    if (process) {
      setEditingProcess(process);
      setIsEditing(true);
    } else {
      setEditingProcess({
        name: '',
        description: '',
        code: '',
        version: '',
        status: true,
        macroProcess: { name: '' },
        user: { name: '' },
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingProcess({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingProcess((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingProcess.id) {
      handleUpdate(editingProcess.id, editingProcess);
    } else {
      handleCreate(e);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Procesos</h1>

        {/* Button to open modal for adding process */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          Agregar Proceso
        </button>

        {/* Modal for creating or editing process */}
        {isModalOpen && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Proceso</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={editingProcess.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      name="description"
                      value={editingProcess.description || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <input
                      type="text"
                      name="code"
                      value={editingProcess.code || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Versión</label>
                    <input
                      type="text"
                      name="version"
                      value={editingProcess.version || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <input
                      type="checkbox"
                      name="status"
                      checked={editingProcess.status || false}
                      onChange={(e) => handleChange({
                        target: { name: 'status', value: e.target.checked }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      {isEditing ? 'Actualizar' : 'Crear'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripcion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de actualización</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Macro Proceso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processes.map((process) => (
                <tr key={process.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{process.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.status ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.creationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.updateDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.macroProcess.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{process.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenModal(process)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(process.id)}
                      className="text-red-600 hover:text-red-900"
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

export default Process;
