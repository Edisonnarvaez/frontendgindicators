import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';

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
  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      } catch (err) {
        console.error(err);
        setError('Failed to fetch SubProcesses');
        setLoading(false);
      }
    };

    const fetchProcesses = async () => {
      try {
        const response = await api.get('/processes/');
        setProcesses(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Processes');
      }
    };

    fetchSubProcesses();
    fetchProcesses();
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
      user: userId, // Usuario fijo, ajusta según sea necesario.
    };

    try {
      if (isEditing) {
        const response = await api.put(
          `/subprocesses/${form.id}/`,
          formData
        );
        alert('SubProceso actualizado exitosamente');
        setSubProcesses((prev) =>
          prev.map((sp) => (sp.id === response.data.id ? response.data : sp))
        );
      } else {
        const response = await api.post('/subprocesses/', formData);
        alert('SubProceso creado exitosamente');
        setSubProcesses((prev) => [...prev, response.data]);
      }

      setIsModalOpen(false);
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
    } catch (error) {
      console.error('Error al guardar los datos', error);
      alert('Error al crear o actualizar el SubProceso');
    }
  };

  const handleEdit = (subProcess: SubProcess) => {
    setForm(subProcess);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (subProcess: SubProcess) => {
    alert(`Viewing SubProcess: ${subProcess.name}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este subproceso?')) return;

    try {
      await api.delete(`/subprocesses/${id}/`);
      setSubProcesses((prev) => prev.filter((subprocess) => subprocess.id !== id));
      alert('Subproceso eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el subproceso', error);
      alert('Error al eliminar el subproceso');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/subprocesses/${id}/`, {
        status: !currentStatus,
      });
      setSubProcesses((prevSubProcesses) =>
        prevSubProcesses.map((subProcess) =>
          subProcess.id === id ? { ...subProcess, status: response.data.status } : subProcess
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado', error);
    }
  };


  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Sub Procesos</h1>

        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={() => {
            setIsModalOpen(true);
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
          }}
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
                      onChange={handleSelectChange}
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
    </Layout>
  );
};

export default SubProcessComponent;
