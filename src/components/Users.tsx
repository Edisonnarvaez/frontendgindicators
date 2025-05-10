import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa6';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  company: number;
  department: number;
  role: number;
  status: boolean;
  creationDate: string;
  updateDate: string;
  lastLogin: string;
  password: string;
}

interface Company {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos en edición

  const [form, setForm] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    company: 0,
    department: 0,
    role: 0,
    status: true,
    lastLogin: '',
    password: '',

  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Departments');
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

    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles/');
        setRoles(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Roles');
      }
    };

    fetchUsers();
    fetchDepartments();
    fetchCompanies();
    fetchRoles();
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
      company: form.company,
      role: form.role,
      //que el usuario se coloque automaticamente en el usuario que esta logueado

      //user: 1,
      //password: form.password || undefined, // Solo enviar si está presente
    };
    delete formData.lastLogin;
    console.log(formData);

    try {
      //let response;
      if (isEditing) {
        const response = await api.put(`/users/${form.id}/`, formData);
        alert('Usuario actualizado exitosamente');
        setUsers((prev) =>
          prev.map((mp) => (mp.id === response.data.id ? response.data : mp))
        );
      } else {
        const response = await api.post(`/users/`, formData);
        alert('Usuario creado exitosamente');
        setUsers((prev) => [...prev, response.data]);
      }

      setIsModalOpen(false);
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        company: 0,
        department: 0,
        role: 0,
        status: true,
        //lastLogin: '',
        password: '',
      });
      setIsEditing(false);
    } //catch (error) {
    //console.error('Error al guardar los datos', error);
    //alert('Error al crear o actualizar el usuario');
    catch (error: any) {
      if (error.response && error.response.data) {
        console.error('Errores del backend:', error.response.data);
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error('Error inesperado:', error);
        alert('Error inesperado al crear o actualizar el usuario');
      }
    }
    //}
  };

  const handleEdit = (user: User) => {
    setForm(user);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await api.delete(`/users/${id}/`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
      alert('Error al eliminar el usuario');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/users/${id}/`, {
        status: !currentStatus,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, status: response.data.status } : user
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado', error);
    }
  };

  // Abrir modal para agregar usuario (limpio, sin datos)
  const handleOpenModal = () => {
    setIsEditing(false);  // Establecer isEditing en false para asegurar que estamos en modo de creación
    setForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      company: 0,
      department: 0,
      role: 0,
      status: true,
      lastLogin: '',
    });  // Limpiar el formulario
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  function handleView(user: User): void {
    throw new Error('Function not implemented.');
  }

  return (

    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Usuarios</h1>

        {/* Botón para abrir el modal para agregar un nuevo macroproceso */}
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={handleOpenModal}  // Usamos la función `handleOpenModal`
        >
          Agregar Usuario
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} Usuario</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Nombres"
                      value={form.firstName || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Apellidos"
                      value={form.lastName || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Usuario"
                      value={form.username || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Contraseña"
                      value={form.password || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required={!isEditing}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
                      value={form.email || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Teléfono"
                      value={form.phone || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
                    <select
                      name="company"
                      value={form.company || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0} disabled>Seleccionar empresa</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Area</label>
                    <select
                      name="department"
                      value={form.department || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
                    <select
                      name="role"
                      value={form.role || 0}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0} disabled>Seleccionar rol</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
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

        {/* Tabla de usuarios */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.firstName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.status ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(user)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(user.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={user.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      title={user.status ? 'Inactivar' : 'Activar'}
                    >
                      {user.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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

export default Users;