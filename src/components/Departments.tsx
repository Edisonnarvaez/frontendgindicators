import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';

interface company {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  departmentCode: string;
  company: number;
  description: string;
  //creationDate: Date;  // Cambiado a string
  status: boolean;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<Partial<Department>>({
    name: '',
    departmentCode: '',
    company: 0,
    description: '',
    //creationDate: new Date(),  // Cambiado a Date
    //creationDate: '',
    status: true,
  });


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch departments');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies/');
        setCompanies(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Companies');
      }
    };

    fetchDepartments();
    fetchCompanies();
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
      //user: 1,
      //creationDate: form.creationDate instanceof Date
      //  ? form.creationDate.toISOString().split('T')[0]
      //  : form.creationDate,
      //creationDate: form.creationDate ? form.creationDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Cambiado a ISO String
    };
    console.log(formData);

    try {
      if (isEditing) {
        const response = await api.put(`/departments/${form.id}/`, formData);
        setDepartments((prev) =>
          prev.map((department) => (department.id === response.data.id ? response.data : department))
        );
        alert('Area actualizada exitosamente');
      } else {
        const response = await api.post('/departments/', formData);
        setDepartments((prev) => [...prev, response.data]);
        alert('Area creada exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar el proceso', error);
      alert('Error al guardar el proceso');
    }
  };

  const handleEdit = (department: Department) => {
    setForm(department);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (department: Department) => {
    alert(`Viewing department: ${department.name}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta area?')) return;

    try {
      await api.delete(`/departments/${id}/`);
      setDepartments((prev) => prev.filter((department) => department.id !== id));
      alert('Area eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar area', error);
      alert('Error al eliminar el area');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/departments/${id}/`, {
        status: !currentStatus,
      });
      setDepartments((prev) =>
        prev.map((department) =>
          department.id === id ? { ...department, status: response.data.status } : department
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado', error);
      alert('Error al cambiar el estado del area');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      departmentCode: '',
      company: 0,
      description: '',
      //creationDate: new Date(),  // Cambiado a Date
      //creationDate: ,
      status: true,
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
        <h1 className="text-3xl font-bold mb-6">Areas</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={openModal}
        >
          Agregar Area
        </button>

        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} Area</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Área</label>
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
                    <label htmlFor="departmentCode" className="block text-sm font-medium text-gray-700">Código de Área</label>
                    <input
                      type="text"
                      name="departmentCode"
                      placeholder="Código de área"
                      value={form.departmentCode || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
                    <select
                      name="company"
                      value={form.company || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccione Empresa</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
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
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      name="status"
                      value={form.status ? 'true' : 'false'}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codigo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripcion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{department.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department.departmentCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {department.status ? 'Activo' : 'Inactivo'}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(department)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(department)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(department.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={department.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(department.id, department.status)}
                      title={department.status ? 'Inactivar' : 'Activar'}
                    >
                      {department.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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

export default Departments;
