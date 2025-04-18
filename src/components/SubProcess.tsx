import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import api from '../api';

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
      user: 1, // Usuario fijo, ajusta según sea necesario.
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
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} SubProceso</h2>
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
                    <label htmlFor="code" className="block text-sm font-medium">Autor</label>
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
                    <label htmlFor="process" className="block text-sm font-medium">Proceso</label>
                    <select
                      name="process"
                      value={form.process || 0}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
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
              {subProcesses.map((subProcess) => (
                <tr key={subProcess.id}>
                  <td className="px-6 py-4">{subProcess.id}</td>
                  <td className="px-6 py-4">{subProcess.name}</td>
                  <td className="px-6 py-4">{subProcess.description}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(subProcess)}>
                      Editar
                    </button>
                    <button className="ml-4 text-red-600 hover:text-red-800" onClick={() => handleDelete(subProcess.id)}>
                      Eliminar
                    </button>
                    <button
                      className={`ml-4 ${subProcess.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                      onClick={() => handleToggleStatus(subProcess.id, subProcess.status)}
                    >
                      {subProcess.status ? 'Inactivar' : 'Activar'}
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
