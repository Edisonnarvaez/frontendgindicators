import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Headquarter {
    id: number;
    name: string;
    habilitationCode: string;
    departament: string;
    city: string;
    address: string;
    habilitationDate: string;
    closingDate: string;
    status: boolean;
}

const Headquarter: React.FC = () => {
    const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.user) as { id: number } | null;
    const userId = user ? user.id : null;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<Partial<Headquarter>>({
        name: '',
        habilitationCode: '',
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
            } catch (err) {
                setError('Failed to fetch headquarters');
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };


        fetchHeadquarters();
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
                const response = await api.put(`/headquarters/${form.id}/`, formData);
                setHeadquarters((prev) =>
                    prev.map((headquarter) => (headquarter.id === response.data.id ? response.data : headquarter))
                );
                alert('Sede actualizada exitosamente');
            } else {
                const response = await api.post('/headquarters/', formData);
                setHeadquarters((prev) => [...prev, response.data]);
                alert('Sede creada exitosamente');
            }

            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error al guardar la sede', error);
            alert('Error al guardar la sede');
        }
    };

    const handleEdit = (headquarter: Headquarter) => {
        setForm(headquarter);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar esta sede?')) return;

        try {
            await api.delete(`/headquarters/${id}/`);
            setHeadquarters((prev) => prev.filter((headquarter) => headquarter.id !== id));
            alert('Sede eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar la sede', error);
            alert('Error al eliminar la sede');
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const response = await api.patch(`/headquarters/${id}/`, {
                status: !currentStatus,
            });
            setHeadquarters((prev) =>
                prev.map((headquarter) =>
                    headquarter.id === id ? { ...headquarter, status: response.data.status } : headquarter
                )
            );
        } catch (error) {
            console.error('Error al cambiar el estado', error);
            alert('Error al cambiar el estado de la sede');
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            habilitationCode: '',
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
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Sede</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder='Nombre de la sede'
                                        value={form.name || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                <label htmlFor="habilitationCode" className="block text-sm font-medium">Codigo de habilitacion</label>
                                <input
                                    type="text"
                                    name="habilitationCode"
                                    placeholder='codigo de habilitationCode de la sede'
                                    value={form.habilitationCode || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                </div>
                                <div>
                                <label htmlFor="departament" className="block text-sm font-medium">Departamento</label>
                                <input
                                    type="text"
                                    name="departament"
                                    placeholder='Departamento de la sede'
                                    value={form.departament || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                </div>
                                <div>
                                <label htmlFor="city" className="block text-sm font-medium">Ciudad</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder='ciudad de la sede'
                                    value={form.city || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required

                                />
                                </div>
                                <div>
                                <label htmlFor="address" className="block text-sm font-medium">Direccion</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder='Direccion de la sede'
                                    value={form.address || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                </div>
                                <div>
                                <label htmlFor="habilitationDate" className="block text-sm font-medium">Fecha de habilitacion</label>
                                <input
                                    type="date"
                                    name="habilitationDate"
                                    placeholder='Fecha de habilitacion de la sede'
                                    value={form.habilitationDate || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                </div>
                                <div>
                                <label htmlFor="closingDate" className="block text-sm font-medium">Fecha de cierre</label>
                                <input
                                    type="date"
                                    name="closingDate"
                                    placeholder='Fecha de cierre de la sede'
                                    value={form.closingDate || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required

                                />
                                </div>
                                <div>
                                <label htmlFor="status" className="block text-sm font-medium">Estado</label>
                                <select
                                    name="status"
                                    value={form.status ? 'true' : 'false'}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
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
                                    <td className="px-6 py-4 whitespace-nowrap">{headquarter.status}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(headquarter)}>
                                            Editar
                                        </button>
                                        <button className="ml-4 text-red-600 hover:text-red-800" onClick={() => handleDelete(headquarter.id)}>
                                            Eliminar
                                        </button>
                                        <button
                                            className={`ml-4 ${headquarter.status ? 'text-yellow-600' : 'text-green-600'} hover:text-yellow-800`}
                                            onClick={() => handleToggleStatus(headquarter.id, headquarter.status)}
                                        >
                                            {headquarter.status ? 'Inactivar' : 'Activar'}
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

export default Headquarter;