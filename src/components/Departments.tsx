import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface Department {
  id: number;
  name: string;
  departmentCode: string;
  company: string;
  description: string;
  creationDate: Date;  // Cambiado a string
  status: boolean;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<Partial<Department>>({
    name: '',
    departmentCode: '',
    company: '',
    description: '',
    creationDate: new Date(),  // Cambiado a Date
    //creationDate: '',
    status: true,
  });


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/departments/');
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
        const response = await axios.get('http://localhost:8000/api/companies/');
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
      user: 1,
      //creationDate: form.creationDate ? form.creationDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Cambiado a ISO String
    };

    try {
      if (isEditing) {
        const response = await axios.put(`http://localhost:8000/api/departments/${form.id}/`, formData);
        setDepartments((prev) =>
          prev.map((department) => (department.id === response.data.id ? response.data : department))
        );
        alert('Area actualizada exitosamente');
      } else {
        const response = await axios.post('http://localhost:8000/api/departments/', formData);
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta area?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/departments/${id}/`);
      setDepartments((prev) => prev.filter((department) => department.id !== id));
      alert('Area eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar area', error);
      alert('Error al eliminar el area');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/departments/${id}/`, {
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
      company: '',
      description: '',
      creationDate: new Date(),  // Cambiado a Date
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Area</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="nombre"
                  value={form.name || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="departmentCode"
                  placeholder="Codigo de area"
                  value={form.departmentCode || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  name="company"
                  value={form.company || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccione Empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="description"
                  placeholder="Descripcion"
                  value={form.description || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="date"
                  name="creationDate"
                  value={form.creationDate?.toISOString().split('T')[0] || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                  
                  
                <select
                  name="status"
                  value={form.status ? 'true' : 'false'}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripcion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creacion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{department.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(department.creationDate).toLocaleDateString()}</td> {/* Formato de fecha legible */}
                  <td className="px-6 py-4 whitespace-nowrap">{department.status ? 'Activo' : 'Inactivo'}</td> {/* Booleano como texto */}
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(department)}>
                      Editar
                    </button>
                    <button className="ml-4 text-red-600 hover:text-red-800" onClick={() => handleDelete(department.id)}>
                      Eliminar
                    </button>
                    <button
                      className={`ml-4 ${department.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                      onClick={() => handleToggleStatus(department.id, department.status)}
                    >
                      {department.status ? 'Inactivar' : 'Activar'}
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
