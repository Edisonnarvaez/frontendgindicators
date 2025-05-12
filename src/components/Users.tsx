import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaToggleOn, FaToggleOff, FaEye } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications';
import ConfirmationModal from './ConfirmationModal';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRBAC } from '../hooks/useRBAC';

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
  const { notifySuccess, notifyError } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const [userIdToToggle, setUserIdToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const { checkPermission, getFilteredData } = useRBAC();

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

  // Verificar acceso al módulo
  if (!checkPermission('users', 'read')) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Acceso Denegado</h1>
          <p>No tienes permisos para acceder a este módulo.</p>
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/');
        setUsers(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError('No se pudieron cargar los usuarios');
        notifyError('No se pudieron cargar los usuarios');
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
      } catch (err: any) {
        console.error('Error fetching departments:', err);
        setError('No se pudieron cargar los departamentos');
        notifyError('No se pudieron cargar los departamentos');
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies/');
        setCompanies(response.data);
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError('No se pudieron cargar las empresas');
        notifyError('No se pudieron cargar las empresas');
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles/');
        setRoles(response.data);
      } catch (err: any) {
        console.error('Error fetching roles:', err);
        setError('No se pudieron cargar los roles');
        notifyError('No se pudieron cargar los roles');
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

    if (!checkPermission('users', 'write')) {
      notifyError('No tienes permisos para crear o editar usuarios');
      return;
    }

    const formData = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      phone: form.phone,
      company: form.company,
      department: form.department,
      role: form.role,
      status: form.status,
      password: form.password,
    };

    try {
      if (isEditing) {
        const response = await api.put(`/users/${form.id}/`, formData);
        setUsers((prev) =>
          prev.map((user) => (user.id === response.data.id ? response.data : user))
        );
        notifySuccess('Usuario actualizado exitosamente');
      } else {
        const response = await api.post(`/users/`, formData);
        setUsers((prev) => [...prev, response.data]);
        notifySuccess('Usuario creado exitosamente');
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
        lastLogin: '',
        password: '',
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error al guardar los datos:', error);
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data ? JSON.stringify(error.response.data) : 'Error al crear o actualizar el usuario');
      notifyError(errorMessage);
    }
  };

  const handleEdit = (user: User) => {
    if (!checkPermission('users', 'write')) {
      notifyError('No tienes permisos para editar usuarios');
      return;
    }
    setForm(user);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!checkPermission('users', 'write')) {
      notifyError('No tienes permisos para eliminar usuarios');
      return;
    }
    setUserIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userIdToDelete) return;

    try {
      await api.delete(`/users/${userIdToDelete}/`);
      setUsers((prev) => prev.filter((user) => user.id !== userIdToDelete));
      notifySuccess('Usuario eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar el usuario:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el usuario';
      notifyError(errorMessage);
    } finally {
      setUserIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    if (!checkPermission('users', 'write')) {
      notifyError('No tienes permisos para cambiar el estado de usuarios');
      return;
    }
    setUserIdToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userIdToToggle) return;

    try {
      const response = await api.patch(`/users/${userIdToToggle.id}/`, {
        status: !userIdToToggle.currentStatus,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userIdToToggle.id ? { ...user, status: response.data.status } : user
        )
      );
      notifySuccess(`Usuario ${userIdToToggle.currentStatus ? 'inactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado del usuario';
      notifyError(errorMessage);
    } finally {
      setUserIdToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleOpenModal = () => {
    if (!checkPermission('users', 'write')) {
      notifyError('No tienes permisos para crear usuarios');
      return;
    }
    setIsEditing(false);
    const newForm = {
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
    };
    setForm(newForm);
    setIsModalOpen(true);
  };

  // Filtrar usuarios según el rol
  const filteredUsers = getFilteredData(users);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Usuarios</h1>

        {/* Botón para agregar usuario, solo visible si tiene permisos de escritura */}
        {checkPermission('users', 'write') && (
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
            onClick={handleOpenModal}
          >
            Agregar Usuario
          </button>
        )}

        {/* Modal de edición/creación */}
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
                      value={form.firstName ?? ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Apellidos"
                      value={form.lastName ?? ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Usuario</label>
                    <input
                      type="text"
                      name="username"
                      id="userName"
                      placeholder="Usuario"
                      value={form.username ?? ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoComplete="new-username"
                    />
                  </div>
                  <div>
                    <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      id="userPassword"
                      placeholder="Contraseña"
                      value={form.password ?? ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required={!isEditing}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
                      value={form.email ?? ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Teléfono"
                      value={form.phone ?? ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
                    <select
                      name="company"
                      value={form.company ?? 0}
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
                      value={form.department ?? 0}
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
                      value={form.role ?? 0}
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

        {/* Modal de visualización */}
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-opacity duration-300 ease-out">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8 transform transition-all duration-300 scale-100 hover:scale-[1.01]">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setIsViewModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center tracking-tight">
                Detalles del Usuario
              </h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Nombre:</span>
                  <span>{selectedUser.firstName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Apellidos:</span>
                  <span>{selectedUser.lastName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Usuario:</span>
                  <span>{selectedUser.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Correo Electrónico:</span>
                  <span>{selectedUser.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Teléfono:</span>
                  <span>{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Empresa:</span>
                  <span>
                    {companies.find((company) => company.id === selectedUser.company)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Área:</span>
                  <span>
                    {departments.find((dept) => dept.id === selectedUser.department)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Rol:</span>
                  <span>
                    {roles.find((role) => role.id === selectedUser.role)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Estado:</span>
                  <span>{selectedUser.status ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Fecha de Creación:</span>
                  <span>{selectedUser.creationDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Fecha de Actualización:</span>
                  <span>{selectedUser.updateDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Último Inicio de Sesión:</span>
                  <span>{selectedUser.lastLogin || 'N/A'}</span>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>
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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.firstName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {departments.find((dept) => dept.id === user.department)?.name || user.department}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {roles.find((role) => role.id === user.role)?.name || user.role}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.status ? 'Activo' : 'Inactivo'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    {checkPermission('users', 'write') && (
                      <>
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(user)}
                          title="Editar"
                        >
                          <FaEdit size={20} />
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
                      </>
                    )}
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(user)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setUserIdToDelete(null);
          setUserIdToToggle(null);
        }}
        onConfirm={() => {
          if (userIdToDelete) confirmDelete();
          if (userIdToToggle) confirmToggleStatus();
        }}
        title="Confirmar Acción"
        message={
          userIdToDelete
            ? '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'
            : userIdToToggle
            ? `¿Estás seguro de que deseas ${userIdToToggle.currentStatus ? 'inactivar' : 'activar'} este usuario?`
            : '¿Estás seguro de que deseas realizar esta acción?'
        }
      />
    </Layout>
  );
};

export default Users;