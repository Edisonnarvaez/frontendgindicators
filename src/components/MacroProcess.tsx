import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface MacroProcess {
  id: number;
  name: string;
  description: string;
  department: string;
  code: string;
  version: string;
  status: boolean;
  creationDate: string;
  updateDate: string;
  user: string;
}

const MacroProcessComponent: React.FC = () => {
  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal

  // Estado del formulario
  const [form, setForm] = useState<Partial<MacroProcess>>({
    name: '',
    description: '',
    department: '',
    code: '',
    version: '',
    status: true,
    creationDate: '',
    updateDate: '',
    user: ''
  });

  useEffect(() => {
    const fetchMacroProcess = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/macroprocesses/');
        setMacroProcesses(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch MacroProcess');
        setLoading(false);
      }
    };

    fetchMacroProcess();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/macroprocesses/', form);
      if (response.status === 201) {
        alert('Macroproceso creado exitosamente');
        setIsModalOpen(false); // Cerrar el modal al enviar el formulario
        setForm({
          name: '',
          description: '',
          department: '',
          code: '',
          version: '',
          status: true,
          creationDate: '',
          updateDate: '',
          user: ''
        }); // Limpiar el formulario
        // Actualizar la lista de macroprocesos después de agregar uno nuevo
        setMacroProcesses((prevMacroProcesses) => [...prevMacroProcesses, response.data]);
      }
    } catch (error) {
      console.error('Error al enviar los datos', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/macroprocesses/${id}/`);
      // Actualizar la lista de macroprocesos después de eliminar uno
      setMacroProcesses((prevMacroProcesses) =>
        prevMacroProcesses.filter((macroProcess) => macroProcess.id !== id)
      );
    } catch (error) {
      console.error('Error al eliminar el macroproceso', error);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Macro Procesos</h1>
        
        {/* Botón para abrir el modal */}
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          Agregar MacroProceso
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Agregar nuevo MacroProceso</h2>
                
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
                    <label htmlFor="department" className="block text-sm font-medium">Área</label>
                    <input
                      type="text"
                      name="department"
                      value={form.department || ''}
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
                    <label htmlFor="status" className="block text-sm font-medium">Estado</label>
                    <select
                      name="status"
                      value={form.status ? 'true' : 'false'}
                      onChange={handleChange}
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
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {macroProcesses.map((macroProcess) => (
                <tr key={macroProcess.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{macroProcess.status ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                      onClick={() => handleDelete(macroProcess.id)}
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

export default MacroProcessComponent;
