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
  nit: string;
  legalRepresentative: string;
  phone: string;
  address: string;
  contactEmail: string;
  foundationDate: string;
  //foundationDate: "dataString";
  status: boolean;
}

const Companies: React.FC = () => {
  const { notifySuccess, notifyError } = useNotifications();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [companyIdToDelete, setCompanyIdToDelete] = useState<number | null>(null);
  const [companyToToggle, setCompanyToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);

  //**********0 */
 
  //******** */

  const [form, setForm] = useState<Partial<Company>>({
    name: '',
    nit: '',
    legalRepresentative: '',
    phone: '',
    address: '',
    contactEmail: '',
    foundationDate: '',
    status: true,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/companies/');
        setCompanies(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError('No se pudieron cargar las empresas');
        notifyError('No se pudieron cargar las empresas');
        setLoading(false);
      }
    };

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
        const response = await api.put(`/companies/${form.id}/`, formData);
        setCompanies((prev) =>
          prev.map((company) => (company.id === response.data.id ? response.data : company))
        );
        notifySuccess('Empresa actualizada exitosamente');
      } else {
        const response = await api.post('/companies/', formData);
        setCompanies((prev) => [...prev, response.data]);
        notifySuccess('Empresa creada exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar la empresa:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al guardar la empresa';
      notifyError(errorMessage);
    }
  };

  const handleEdit = (company: Company) => {
    setForm(company);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setCompanyIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!companyIdToDelete) return;

    try {
      await api.delete(`/companies/${companyIdToDelete}/`);
      setCompanies((prev) => prev.filter((company) => company.id !== companyIdToDelete));
      notifySuccess('Empresa eliminada exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar la empresa:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar la empresa';
      notifyError(errorMessage);
    } finally {
      setCompanyIdToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setCompanyToToggle({ id, currentStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!companyToToggle) return;

    try {
      const response = await api.patch(`/companies/${companyToToggle.id}/`, {
        status: !companyToToggle.currentStatus,
      });
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyToToggle.id ? { ...company, status: response.data.status } : company
        )
      );
      notifySuccess(`Empresa ${companyToToggle.currentStatus ? 'inactivada' : 'activada'} exitosamente`);
    } catch (error: any) {
      console.error('Error al cambiar el estado:', error);
      const errorMessage =
        error.response?.data?.message || 'Error al cambiar el estado de la empresa';
      notifyError(errorMessage);
    } finally {
      setCompanyToToggle(null);
      setIsConfirmModalOpen(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      nit: '',
      legalRepresentative: '',
      phone: '',
      address: '',
      contactEmail: '',
      foundationDate: '',
      status: true,
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleView = (company: Company) => {
    console.log('Ver empresa:', company);
    notifyError('Función de visualización no implementada');
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Empresa</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={openModal}
        >
          Agregar Empresa
        </button>

        {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg mx-auto my-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} Empresa</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la empresa</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nombre de la empresa"
                      value={form.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 blockfaq w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="nit" className="block text-sm font-medium text-gray-700">NIT de la empresa</label>
                    <input
                      type="text"
                      name="nit"
                      placeholder="NIT de la empresa"
                      value={form.nit || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="legalRepresentative" className="block text-sm font-medium text-gray-700">Representante legal</label>
                    <input
                      type="text"
                      name="legalRepresentative"
                      placeholder="Representante legal"
                      value={form.legalRepresentative || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono de la empresa</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Teléfono de la empresa"
                      value={form.phone || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección de la empresa</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Dirección de la empresa"
                      value={form.address || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Correo electrónico del representante legal</label>
                    <input
                      type="email"
                      name="contactEmail"
                      placeholder="Correo electrónico del representante legal"
                      value={form.contactEmail || ''}
                      onChange={handleChange}
                      className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="foundationDate" className="block text-sm font-medium text-gray-700">Fecha de fundación de la empresa</label>
                    <input
                      type="date"
                      name="foundationDate"
                      placeholder="Fecha de fundación de la empresa"
                      value={form.foundationDate || ''}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Representante legal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direccion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{company.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{company.nit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{company.legalRepresentative}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{company.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{company.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{company.status ? 'Activo' : 'Inactivo'}</td>

                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(company)}
                      title="Editar"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleView(company)}
                      title="Ver"
                    >
                      <FaEye size={20} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(company.id)}
                      title="Eliminar"
                    >
                      <FaTrash size={20} />
                    </button>
                    <button
                      className={company.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      onClick={() => handleToggleStatus(company.id, company.status)}
                      title={company.status ? 'Inactivar' : 'Activar'}
                    >
                      {company.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setCompanyIdToDelete(null);
            setCompanyToToggle(null);
          }}
          onConfirm={() => {
            if (companyIdToDelete) confirmDelete();
            if (companyToToggle) confirmToggleStatus();
          }}
          title="Confirmar Acción"
          message={
            companyIdToDelete
              ? '¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.'
              : companyToToggle
                ? `¿Estás seguro de que deseas ${companyToToggle.currentStatus ? 'inactivar' : 'activar'} esta empresa?`
                : '¿Estás seguro de que deseas realizar esta acción?'
          }
        />

      </div>

    </Layout>
  );
};

export default Companies;