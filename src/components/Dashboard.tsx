import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setIndicators, setLoading, setError } from '../store/slices/indicatorSlice';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from './Layout';
import { IoBagHandle, IoPieChart, IoPeople, IoCart } from 'react-icons/io5';

// Componente de estadísticas
function DashboardStatsGrid() {
  return (
    <div className="flex gap-4 mb-8">
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-sky-500">
          <IoBagHandle className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-light">Total Results</span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">45</strong>
          </div>
        </div>
      </BoxWrapper>
      <BoxWrapper>
        <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-600">
          <IoPieChart className="text-2xl text-white" />
        </div>
        <div className="pl-4">
          <span className="text-sm text-gray-500 font-light">Filtered Indicators</span>
          <div className="flex items-center">
            <strong className="text-xl text-gray-700 font-semibold">12</strong>
          </div>
        </div>
      </BoxWrapper>
    </div>
  );
}

function BoxWrapper({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-sm p-4 flex-1 border border-gray-200 flex items-center">{children}</div>;
}

// Filtros para el Dashboard
const Filters = ({ onFilter }: { onFilter: (filters: any) => void }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [macroProcess, setMacroProcess] = useState('');
  const [process, setProcess] = useState('');
  const [subProcess, setSubProcess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ startDate, endDate, macroProcess, process, subProcess });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 rounded"
        placeholder="Start Date"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 rounded"
        placeholder="End Date"
      />
      <input
        type="text"
        value={macroProcess}
        onChange={(e) => setMacroProcess(e.target.value)}
        className="border p-2 rounded"
        placeholder="Macroprocess"
      />
      <input
        type="text"
        value={process}
        onChange={(e) => setProcess(e.target.value)}
        className="border p-2 rounded"
        placeholder="Process"
      />
      <input
        type="text"
        value={subProcess}
        onChange={(e) => setSubProcess(e.target.value)}
        className="border p-2 rounded"
        placeholder="Subprocess"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-700 transition"
      >
        Apply Filters
      </button>
    </form>
  );
};

// Componente principal Dashboard
const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { indicators, loading, error } = useSelector((state: RootState) => state.indicators);

  const fetchIndicators = async (filters: any) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get('http://localhost:8000/api/indicators/', { params: filters });
      dispatch(setIndicators(response.data));
    } catch (err) {
      dispatch(setError('Failed to fetch indicators'));
    }
  };

  const handleFilter = (filters: any) => {
    fetchIndicators(filters);
  };

  useEffect(() => {
    fetchIndicators({});
  }, []);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Filtros */}
        <Filters onFilter={handleFilter} />

        {/* Sección de estadísticas */}
        <DashboardStatsGrid />

        {/* Sección de gráficos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Indicadores</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={indicators}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
