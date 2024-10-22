import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface Process {
  id: number;
  name: string;
  description: string;
  department: string;
  code: string;
  version: string;
  status: boolean;
  creationDate: "datestring";
  updateDate: "datestring";
  user: string;

}

const Process: React.FC = () => {
  const [Process, setProcess] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/process/');
        setProcess(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch Process');
        setLoading(false);
      }
    };

    fetchProcess();
  }, []);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Procesos</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">creationDate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">updateDate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">user</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Process.map((Proces) => (
                <tr key={Proces.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.creationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.updateDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Proces.user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Process;