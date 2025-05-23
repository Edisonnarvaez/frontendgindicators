import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaEdit } from 'react-icons/fa';
import { FaEye, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa6';
import useNotifications from '../hooks/useNotifications';
import ConfirmationModal from './ConfirmationModal';

interface company {
    id: number;
    name: string;
}

interface Headquarter {
    id: number;
    name: string;
    habilitationCode: string;
    company: number;
    departament: string;
    city: string;
    address: string;
    habilitationDate: string;
    closingDate: string;
    status: boolean;
}

const Headquarter: React.FC = () => {
    const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
    const [companies, setCompanies] = useState<company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.user) as { id: number } | null;
    const userId = user ? user.id : null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const { notifySuccess, notifyError } = useNotifications();
    const [headquarterIdToDelete, setHeadquarterIdToDelete] = useState<number | null>(null);
    const [headquarterToToggle, setHeadquarterToToggle] = useState<{ id: number; currentStatus: boolean } | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewResult, setViewResult] = useState<Headquarter | null>(null);
    const [form, setForm] = useState<Partial<Headquarter>>({
        name: '',
        habilitationCode: '',
        company: 0,
        departament: '',
        city: '',
        address: '',
        habilitationDate: '',
        closingDate: '',
        status: true,
    });

    useEffect(() => {
        const fetchHeadquarters = async () => {
            try {
                const response = await api.get('/headquarters/');
                setHeadquarters(response.data);
                setLoading(false);
            } catch (err: any) {
                console.error('Error al obtener sedes:', err);
                setError('No se pudieron cargar las sedes');
                notifyError('No se pudieron cargar las sedes');
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

        fetchHeadquarters();
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
                const response = await api.put(`/headquarters/${form.id}/`, formData);
                setHeadquarters((prev) =>
                    prev.map((headquarter) => (headquarter.id === response.data.id ? response.data : headquarter))
                );
                notifySuccess('Sede actualizada exitosamente');
            } else {
                const response = await api.post('/headquarters/', formData);
                setHeadquarters((prev) => [...prev, response.data]);
                notifySuccess('Sede creada exitosamente');
            }

            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            console.error('Error al guardar la sede:', error);
            const errorMessage =
                error.response?.data?.message || 'Error al guardar la sede';
            notifyError(errorMessage);
        }
    };

    const handleEdit = (headquarter: Headquarter) => {
        setForm(headquarter);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleView = (headquarter: Headquarter) => {
        setViewResult(headquarter);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setHeadquarterIdToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!headquarterIdToDelete) return;

        try {
            await api.delete(`/headquarters/${headquarterIdToDelete}/`);
            setHeadquarters((prev) => prev.filter((headquarter) => headquarter.id !== headquarterIdToDelete));
            notifySuccess('Sede eliminada exitosamente');
        } catch (error: any) {
            console.error('Error al eliminar la sede:', error);
            const errorMessage =
                error.response?.data?.message || 'Error al eliminar la sede';
            notifyError(errorMessage);
        } finally {
            setHeadquarterIdToDelete(null);
            setIsConfirmModalOpen(false);
        }
    };

    const handleToggleStatus = (id: number, currentStatus: boolean) => {
        setHeadquarterToToggle({ id, currentStatus });
        setIsConfirmModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!headquarterToToggle) return;

        try {
            const response = await api.patch(`/headquarters/${headquarterToToggle.id}/`, {
                status: !headquarterToToggle.currentStatus,
            });
            setHeadquarters((prev) =>
                prev.map((headquarter) =>
                    headquarter.id === headquarterToToggle.id ? { ...headquarter, status: response.data.status } : headquarter
                )
            );
            notifySuccess(`Sede ${headquarterToToggle.currentStatus ? 'inactivada' : 'activada'} exitosamente`);
        } catch (error: any) {
            console.error('Error al cambiar el estado:', error);
            const errorMessage =
                error.response?.data?.message || 'Error al cambiar el estado de la sede';
            notifyError(errorMessage);
        } finally {
            setHeadquarterToToggle(null);
            setIsConfirmModalOpen(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            habilitationCode: '',
            company: 0,
            departament: '',
            city: '',
            address: '',
            habilitationDate: '',
            closingDate: '',
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
                <h1 className="text-3xl font-bold mb-6">Sedes</h1>
                <button
                    className="mb-4 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    onClick={openModal}
                >
                    Agregar Sedes
                </button>

                {isModalOpen && (
                    <div className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg mx-auto my-4 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{isEditing ? 'Editar' : 'Agregar'} Sede</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Nombre de la sede"
                                            value={form.name || ''}
                                            onChange={handleChange}
                                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="habilitationCode" className="block text-sm font-medium text-gray-700">Código de habilitación</label>
                                        <input
                                            type="text"
                                            name="habilitationCode"
                                            placeholder="Código de habilitación de la sede"
                                            value={form.habilitationCode || ''}
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
                                        <label htmlFor="departament" className="block text-sm font-medium text-gray-700">Departamento</label>
                                        <input
                                            type="text"
                                            name="departament"
                                            placeholder="Departamento de la sede"
                                            value={form.departament || ''}
                                            onChange={handleChange}
                                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="Ciudad de la sede"
                                            value={form.city || ''}
                                            onChange={handleChange}
                                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="Dirección de la sede"
                                            value={form.address || ''}
                                            onChange={handleChange}
                                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="habilitationDate" className="block text-sm font-medium text-gray-700">Fecha de habilitación</label>
                                        <input
                                            type="date"
                                            name="habilitationDate"
                                            placeholder="Fecha de habilitación de la sede"
                                            value={form.habilitationDate || ''}
                                            onChange={handleChange}
                                            className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700">Fecha de cierre</label>
                                        <input
                                            type="date"
                                            name="closingDate"
                                            placeholder="Fecha de cierre de la sede"
                                            value={form.closingDate || ''}
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
                                Detalles de la Sede
                            </h2>

                            {/* Contenido del modal */}
                            <div className="space-y-4 text-gray-700">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Nombre:</span>
                                    <span>{viewResult.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Código de Habilitación:</span>
                                    <span>{viewResult.habilitationCode || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Empresa:</span>
                                    <span>
                                        {companies.find((company) => company.id === viewResult.company)?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Departamento:</span>
                                    <span>{viewResult.departament || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Ciudad:</span>
                                    <span>{viewResult.city || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Dirección:</span>
                                    <span>{viewResult.address || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Fecha de Habilitación:</span>
                                    <span>{viewResult.habilitationDate || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Fecha de Cierre:</span>
                                    <span>{viewResult.closingDate || 'N/A'}</span>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de la sede</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codigo de habilitacion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direccion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de habilitacion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de cierre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {headquarters.map((headquarter) => (
                                <tr key={headquarter.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.habilitationCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.departament}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.habilitationDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.closingDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.status ? 'Activo' : 'Inactivo'}</td>

                                    <td className="px-6 py-4 text-sm text-gray-500 flex space-x-4">
                                        <button
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => handleEdit(headquarter)}
                                            title="Editar"
                                        >
                                            <FaEdit size={20} />
                                        </button>
                                        <button
                                            className="text-green-600 hover:text-green-800"
                                            onClick={() => handleView(headquarter)}
                                            title="Ver"
                                        >
                                            <FaEye size={20} />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => handleDelete(headquarter.id)}
                                            title="Eliminar"
                                        >
                                            <FaTrash size={20} />
                                        </button>
                                        <button
                                            className={headquarter.status ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                                            onClick={() => handleToggleStatus(headquarter.id, headquarter.status)}
                                            title={headquarter.status ? 'Inactivar' : 'Activar'}
                                        >
                                            {headquarter.status ? <FaToggleOff size={20} /> : <FaToggleOn size={20} />}
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
                    setHeadquarterIdToDelete(null);
                    setHeadquarterToToggle(null);
                }}
                onConfirm={() => {
                    if (headquarterIdToDelete) confirmDelete();
                    if (headquarterToToggle) confirmToggleStatus();
                }}
                title="Confirmar Acción"
                message={
                    headquarterIdToDelete
                        ? '¿Estás seguro de que deseas eliminar esta sede? Esta acción no se puede deshacer.'
                        : headquarterToToggle
                            ? `¿Estás seguro de que deseas ${headquarterToToggle.currentStatus ? 'inactivar' : 'activar'} esta sede?`
                            : '¿Estás seguro de que deseas realizar esta acción?'
                }
            />
        </Layout>
    );
};

export default Headquarter;