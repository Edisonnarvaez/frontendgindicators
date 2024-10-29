// src/components/MacroProcessComponent.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout'; // Si tienes un componente Layout

interface MacroProcess {
  id: number;
  name: string;
  description: string;
  department: string;
  code: string;
  version: string;
  status: boolean;
}

const MacroProcessComponent: React.FC = () => {
  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMacroProcesses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/macroprocesses/');
        setMacroProcesses(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los macroprocesos');
        setLoading(false);
      }
    };

    fetchMacroProcesses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Macro Procesos</h1>
        
        {/* Botón para abrir el formulario en una nueva pestaña */}
        <button
          className="text-indigo-600 hover:text-indigo-900"
          onClick={() => window.open('/new-macro-process', '_blank')}
        >
          Agregar nuevo
        </button>

        {/* Tabla para mostrar los macroprocesos */}
        <table className="min-w-full mt-6">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Área</th>
              <th>Código</th>
              <th>Versión</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {macroProcesses.map((macroProcess) => (
              <tr key={macroProcess.id}>
                <td>{macroProcess.name}</td>
                <td>{macroProcess.description}</td>
                <td>{macroProcess.department}</td>
                <td>{macroProcess.code}</td>
                <td>{macroProcess.version}</td>
                <td>{macroProcess.status ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default MacroProcessComponent;
