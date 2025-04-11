import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user) as { id: number } | null;
  const userId = user ? user.id : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      } catch (err) {
        setError('Failed to fetch companies');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };


    fetchCompanies();
    //fetchMacroProcesses();
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
    console.log(formData);

    try {
      if (isEditing) {
        const response = await api.put(`/companies/${form.id}/`, formData);
        setCompanies((prev) =>
          prev.map((company) => (company.id === response.data.id ? response.data : company))
        );
        alert('Empresa actualizada exitosamente');
      } else {
        const response = await api.post('/companies/', formData);
        setCompanies((prev) => [...prev, response.data]);
        alert('Empresa creada exitosamente');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar la empresa', error);
      alert('Error al guardar la empresa');
    }
  };

  const handleEdit = (company: Company) => {
    setForm(company);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta empresa?')) return;

    try {
      await api.delete(`/companies/${id}/`);
      setCompanies((prev) => prev.filter((company) => company.id !== id));
      alert('Epresa eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar la empresa', error);
      alert('Error al eliminar la empresa');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/companies/${id}/`, {
        status: !currentStatus,
      });
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === id ? { ...company, status: response.data.status } : company
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado', error);
      alert('Error al cambiar el estado de la empresa');
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

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Empresas</h1>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          onClick={openModal}
        >
          Agregar Empresa
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Empresa</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder='Nombre de la empresa'
                  value={form.name || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="nit"
                  placeholder='NIT de la empresa'
                  value={form.nit || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="legalRepresentative"
                  placeholder='Representante legal'
                  value={form.legalRepresentative || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder='Telefono de la empresa'
                  value={form.phone || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required

                />
                <input
                  type="text"
                  name="address"
                  placeholder='Direccion de la empresa'
                  value={form.address || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  name="contactEmail"
                  placeholder='Correo electronico del representante legal'
                  value={form.contactEmail || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="date"
                  name="foundationDate"
                  placeholder='Fecha de fundacion de la empresa'
                  value={form.foundationDate || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required

                />              
                <select
                  name="status"
                  value={form.status ? 'true' : 'false'}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
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
                  <td className="px-6 py-4 whitespace-nowrap">{company.status}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(company)}>
                      Editar
                    </button>
                    <button className="ml-4 text-red-600 hover:text-red-800" onClick={() => handleDelete(company.id)}>
                      Eliminar
                    </button>
                    <button
                      className={`ml-4 ${company.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                      onClick={() => handleToggleStatus(company.id, company.status)}
                    >
                      {company.status ? 'Inactivar' : 'Activar'}
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

export default Companies;