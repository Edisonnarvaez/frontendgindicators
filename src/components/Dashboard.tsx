import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setIndicators, setLoading, setError } from '../store/slices/indicatorSlice';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from './Layout';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { indicators, loading, error } = useSelector((state: RootState) => state.indicators);

  useEffect(() => {
    const fetchIndicators = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get('http://your-backend-url/api/indicators/');
        dispatch(setIndicators(response.data));
      } catch (err) {
        dispatch(setError('Failed to fetch indicators'));
      }
    };

    fetchIndicators();
  }, [dispatch]);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Health Indicators Overview</h2>
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