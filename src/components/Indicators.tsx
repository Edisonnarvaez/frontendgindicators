import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setIndicators, setLoading, setError } from '../store/slices/indicatorSlice';
import axios from 'axios';
import Layout from './Layout';

interface Indicator {
  id: number;
  name: string;
  value: number;
}

const Indicators: React.FC = () => {
  const dispatch = useDispatch();
  const { indicators, loading, error } = useSelector((state: RootState) => state.indicators);
  const [newIndicator, setNewIndicator] = useState({ name: '', value: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Partial<Indicator>>({});

  useEffect(() => {
    fetchIndicators();
  }, [dispatch]);

  const fetchIndicators = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get('http://localhost:8000/api/indicators/');
      dispatch(setIndicators(response.data));
    } catch (err) {
      dispatch(setError('Failed to fetch indicators'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/indicators/', newIndicator);
      setNewIndicator({ name: '', value: 0 });
      fetchIndicators();
      setIsModalOpen(false);
    } catch (err) {
      dispatch(setError('Failed to create indicator'));
    }
  };

  const handleUpdate = async (id: number, updatedIndicator: Partial<Indicator>) => {
    try {
      await axios.put(`http://localhost:8000/api/indicators/${id}/`, updatedIndicator);
      fetchIndicators();
      setIsModalOpen(false);
    } catch (err) {
      dispatch(setError('Failed to update indicator'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/indicators/${id}/`);
      fetchIndicators();
    } catch (err) {
      dispatch(setError('Failed to delete indicator'));
    }
  };

  const handleOpenModal = (indicator?: Indicator) => {
    if (indicator) {
      setEditingIndicator(indicator);
      setIsEditing(true);
    } else {
      setEditingIndicator({ name: '', value: 0 });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingIndicator({ name: '', value: 0 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingIndicator((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingIndicator.id) {
      handleUpdate(editingIndicator.id, editingIndicator);
    } else {
      handleCreate(e);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Indicadores</h1>

        {/* Button to open modal for adding indicator */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          Agregar Indicador
        </button>

        {/* Modal for creating or editing indicator */}
        {isModalOpen && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar' : 'Agregar'} Indicador</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={editingIndicator.name || ''}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Valor</label>
                    <input
                      type="number"
                      name="value"
                      value={editingIndicator.value || 0}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      {isEditing ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicators.map((indicator) => (
                <tr key={indicator.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{indicator.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{indicator.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenModal(indicator)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(indicator.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
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

export default Indicators;
