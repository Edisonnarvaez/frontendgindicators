import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

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
  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos en edición

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
        const response = await axios.get('http://localhost:8000/api/macroprocesses/');
        setMacroProcesses(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch MacroProcesses');
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/departments/');
        setDepartments(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Departments');
      }
    };

    fetchMacroProcesses();
    fetchDepartments();
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
      department: form.department, 
      user: 1, 
    };

    try {
      if (isEditing) {
        const response = await axios.put(
          `http://localhost:8000/api/macroprocesses/${form.id}/`,
          formData
        );
        alert('Macroproceso actualizado exitosamente');
        setMacroProcesses((prev) =>
          prev.map((mp) => (mp.id === response.data.id ? response.data : mp))
        );
      } else {
        const response = await axios.post('http://localhost:8000/api/macroprocesses/', formData);
        alert('Macroproceso creado exitosamente');
        setMacroProcesses((prev) => [...prev, response.data]);
      }

      setIsModalOpen(false);
      setForm({
        name: '',
        description: '',
        department: 0,
        code: '',
        version: '',
        status: true,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los datos', error);
      alert('Error al crear o actualizar el macroproceso');
    }
  };

  const handleEdit = (macroProcess: MacroProcess) => {
    setForm(macroProcess);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este macroproceso?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/macroprocesses/${id}/`);
      setMacroProcesses((prev) => prev.filter((macroProcess) => macroProcess.id !== id));
      alert('Macroproceso eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el macroproceso', error);
      alert('Error al eliminar el macroproceso');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/macroprocesses/${id}/`, {
        status: !currentStatus,
      });
      setMacroProcesses((prevMacroProcesses) =>
        prevMacroProcesses.map((macroProcess) =>
          macroProcess.id === id ? { ...macroProcess, status: response.data.status } : macroProcess
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado', error);
    }
  };

  // Abrir modal para agregar macroproceso (limpio, sin datos)
  const handleOpenModal = () => {
    setIsEditing(false);  // Establecer isEditing en false para asegurar que estamos en modo de creación
    setForm({
      name: '',
      description: '',
      department: 0,
      code: '',
      version: '',
      status: true,
    });  // Limpiar el formulario
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
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
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} MacroProceso</h2>
                
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
                    <label htmlFor="department" className="block text-sm font-medium">Departamento</label>
                    <select
                      name="department"
                      value={form.department || 0}  
                      onChange={handleChange}  
                      className="mt-1 p-2 block w-full shadow-sm border border-gray-300 rounded-md"
                    >
                      <option value={0} disabled>Seleccionar area</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
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

        {/* Tabla de macroprocesos */}
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
              {macroProcesses.map((macroProcess) => (
                <tr key={macroProcess.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{macroProcess.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{macroProcess.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{macroProcess.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(macroProcess)}
                    >
                      Editar
                    </button>
                    <button
                      className="ml-4 text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(macroProcess.id)}
                    >
                      Eliminar
                    </button>
                    <button
                      className={`ml-4 ${macroProcess.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                      onClick={() => handleToggleStatus(macroProcess.id, macroProcess.status)}
                    >
                      {macroProcess.status ? 'Inactivar' : 'Activar'}
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