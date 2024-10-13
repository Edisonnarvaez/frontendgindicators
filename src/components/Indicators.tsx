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

  useEffect(() => {
    fetchIndicators();
  }, [dispatch]);

  const fetchIndicators = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get('http://your-backend-url/api/indicators/');
      dispatch(setIndicators(response.data));
    } catch (err) {
      dispatch(setError('Failed to fetch indicators'));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://your-backend-url/api/indicators/', newIndicator);
      setNewIndicator({ name: '', value: 0 });
      fetchIndicators();
    } catch (err) {
      dispatch(setError('Failed to create indicator'));
    }
  };

  const handleUpdate = async (id: number, updatedIndicator: Partial<Indicator>) => {
    try {
      await axios.put(`http://your-backend-url/api/indicators/${id}/`, updatedIndicator);
      fetchIndicators();
    } catch (err) {
      dispatch(setError('Failed to update indicator'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://your-backend-url/api/indicators/${id}/`);
      fetchIndicators();
    } catch (err) {
      dispatch(setError('Failed to delete indicator'));
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Indicators</h1>
        <form onSubmit={handleCreate} className="mb-6">
          <input
            type="text"
            value={newIndicator.name}
            onChange={(e) => setNewIndicator({ ...newIndicator, name: e.target.value })}
            placeholder="Indicator Name"
            className="mr-2 p-2 border rounded"
          />
          <input
            type="number"
            value={newIndicator.value}
            onChange={(e) => setNewIndicator({ ...newIndicator, value: parseFloat(e.target.value) })}
            placeholder="Value"
            className="mr-2 p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Indicator</button>
        </form>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicators.map((indicator) => (
                <tr key={indicator.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{indicator.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{indicator.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleUpdate(indicator.id, { value: indicator.value + 1 })}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Increment
                    </button>
                    <button
                      onClick={() => handleDelete(indicator.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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