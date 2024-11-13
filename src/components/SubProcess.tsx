import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface SubProcess {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string;
  autor: string;
  status: boolean;
  creationDate: string;
  updateDate: string;
  process: { name: string };
  user: { name: string };
}

const SubProcess: React.FC = () => {
  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<SubProcess>>({
    name: '',
    description: '',
    code: '',
    version: '',
    autor: '',
    status: true,
    process: { name: '' }, 
    user: { name: '' },
  });

  useEffect(() => {
    const fetchSubProcesses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/subprocesses/');
        setSubProcesses(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch SubProcess');
        setLoading(false);
      }
    };

    fetchSubProcesses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
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
      status: form.status,
      process: form.process,
      user: form.user,
    };

    try {
      if (isEditing) {
        const response = await axios.put(`http://localhost:8000/api/subprocesses/${form.id}/`, formData);
        alert('SubProceso actualizado exitosamente');
        setSubProcesses((prev) =>
          prev.map((sub) => (sub.id === response.data.id ? response.data : sub))
        );
      } else {
        const response = await axios.post('http://localhost:8000/api/subprocesses/', formData);
        alert('SubProceso creado exitosamente');
        setSubProcesses((prev) => [...prev, response.data]);
      }

      setIsModalOpen(false);
      setForm({
        name: '',
        description: '',
        code: '',
        version: '',
        autor: '',
        status: true,
        process: { name: '' },
        user: { name: '' },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los datos', error);
      alert('Error al crear o actualizar el subproceso');
    }
  };

  const handleEdit = (subProcess: SubProcess) => {
    setForm(subProcess);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/subprocesses/${id}/`);
      setSubProcesses((prevSubProcesses) =>
        prevSubProcesses.filter((subProcess) => subProcess.id !== id)
      );
    } catch (error) {
      console.error('Error al eliminar el subproceso', error);
    }
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setForm({
      name: '',
      description: '',
      code: '',
      version: '',
      autor: '',
      status: true,
      process: { name: '' },
      user: { name: '' },
    });
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Sub Procesos</h1>
        
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={handleOpenModal}
        >
          Agregar SubProceso
        </button>

        {/* Modal */}
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
                    <label htmlFor="autor" className="block text-sm font-medium">Autor</label>
                    <input
                      type="text"
                      name="autor"
                      value={form.autor || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                      required
                    />
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
                  {/* Opcionales: Asociar el proceso y el usuario si corresponde */}
                  <div>
                    <label htmlFor="process" className="block text-sm font-medium">Proceso</label>
                    <input
                      type="text"
                      name="process"
                      value={form.process?.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="user" className="block text-sm font-medium">Usuario</label>
                    <input
                      type="text"
                      name="user"
                      value={form.user?.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                    />
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

        {/* Tabla de SubProcesos */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subProcesses.map((subProcess) => (
                <tr key={subProcess.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{subProcess.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subProcess.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subProcess.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subProcess.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(subProcess)}
                    >
                      Editar
                    </button>
                    <button
                      className="ml-4 text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(subProcess.id)}
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

export default SubProcess;
