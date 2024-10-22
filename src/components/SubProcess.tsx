import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

interface SubProcess {
  id: number;
  name: string;
  description: string;
  code: string;
  version: string;
  autor: string;
  status: boolean;
  creationDate: "datestring";
  updateDate: "datestring";
  process: string;
  user: string;

}

const SubProcess: React.FC = () => {
  const [SubProcess, setSubProcess] = useState<SubProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubProcess = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/subprocesses/');
        setSubProcess(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch SubProcess');
        setLoading(false);
      }
    };

    fetchSubProcess();
  }, []);

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Sub Procesos</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripcion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codigo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de creacion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de actualizacion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proceso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {SubProcess.map((SubProces) => (
                <tr key={SubProces.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.autor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.creationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.updateDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.process.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{SubProces.user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SubProcess;