import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';
import useNotifications from '../hooks/useNotifications';
import ConfirmationModal from './ConfirmationModal';

interface Company {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  departmentCode: string;
  company: number;
  description: string;
  status: boolean;
}

const Departments: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [departmentIdToDelete, setDepartmentIdToDelete] = useState<number | null>(null);
  const [departmentToToggle, setDepartmentToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewResult, setViewResult] = useState<Department | null>(null);

  const [form, setForm] = useState<Partial<Department>>({
    name: '',
    departmentCode: '',
    company: 0,
    description: '',
    status: true,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al obtener areas:', err);
        setError('No se pudieron cargar las áreas');
        notifyError('No se pudieron cargar las áreas');
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies/');
        setCompanies(response.data);
      } catch (err: any) {
        console.error('Error al obtener empresas:', err);
        setError('No se pudieron cargar las empresas');
        notifyError('No se pudieron cargar las empresas');
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
    };

    try {
      if (isEditing) {
        const response = await api.put(`/departments/${form.id}/`, formData);
        setDepartments((prev) =>
          prev.map((department) => (department.id === response.data.id ? response.data : department))
        );
        notifySuccess('Área actualizada exitosamente');
      } else {
        const response = await api.post('/departments/', formData);
        setDepartments((prev) => [...prev, response.data]);
        notifySuccess('Área creada exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar el área:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al guardar el área';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (department: Department) => {
    setForm(department);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleView = (department: Department) => {
    setViewResult(department);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDepartmentIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentIdToDelete) return;

    try {
      await api.delete(`/departments/${departmentIdToDelete}/`);
      setDepartments((prev) => prev.filter((department) => department.id !== departmentIdToDelete));
      notifySuccess('Área eliminada exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar el área:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el área';
      notifyError(errorMessage);
    } finally {
      setDepartmentIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setDepartmentToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!departmentToToggle) return;

    try {
      const response = await api.patch(`/departments/${departmentToToggle.id}/`, {
        status: !departmentToToggle.currentStatus,
      });
      setDepartments((prev) =>
        prev.map((department) =>
          department.id === departmentToToggle.id ? { ...department, status: response.data.status } : department
        )
      );
      notifySuccess(`Área ${departmentToToggle.currentStatus ? 'inactivada' : 'activada'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado del área';
      notifyError(errorMessage);
    } finally {
      setDepartmentToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      departmentCode: '',
      company: 0,
      description: '',
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
        
        {/* Modal de visualización */}
        {isViewModalOpen && viewResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 transition-opacity duration-300 ease-out">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8 transform transition-all duration-300 scale-100 hover:scale-[1.01]">
              {/* Botón de cerrar en la esquina superior derecha */}
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

              {/* Título del modal */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center tracking-tight">
                Detalles del Área
              </h2>

              {/* Contenido del modal */}
              <div className="space-y-4 text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Nombre:</span>
                  <span>{viewResult.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Código de Área:</span>
                  <span>{viewResult.departmentCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Empresa:</span>
                  <span>
                    {companies.find((company) => company.id === viewResult.company)?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Descripción:</span>
                  <span>{viewResult.description || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Estado:</span>
                  <span>{viewResult.status ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>

              {/* Botón de cerrar en el footer */}
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
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setDepartmentIdToDelete(null);
          setDepartmentToToggle(null);
        }}
        onConfirm={() => {
          if (departmentIdToDelete) confirmDelete();
          if (departmentToToggle) confirmToggleStatus();
        }}
        title="Confirmar Acción"
        message={
          departmentIdToDelete
            ? '¿Estás seguro de que deseas eliminar esta área? Esta acción no se puede deshacer.'
            : departmentToToggle
            ? `¿Estás seguro de que deseas ${departmentToToggle.currentStatus ? 'inactivar' : 'activar'} esta área?`
            : '¿Estás seguro de que deseas realizar esta acción?'
        }
      />
    </Layout>
  );
};

export default Departments;