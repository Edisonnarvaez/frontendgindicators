import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import Layout from './Layout';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

const Dashboard: React.FC = () => {
  interface MacroProcess {
    id: number;
    name: string;
  }

  const [macroProcesses, setMacroProcesses] = useState<MacroProcess[]>([]);
  interface Process {
    id: number;
    name: string;
  }

  const [processes, setProcesses] = useState<Process[]>([]);
  interface SubProcess {
    id: number;
    name: string;
  }

  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);
  const [indicators, setIndicators] = useState([]);
  interface Result {
    macroProcess: number;
    process: number;
    subProcess: number;
    creationDate: string;
    calculatedValue: number;
  }

  const [results, setResults] = useState<Result[]>([]);
  
  const [selectedMacroProcess, setSelectedMacroProcess] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedSubProcess, setSelectedSubProcess] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const macroRes = await axios.get('http://localhost:8000/api/macroprocesses/');
        const processRes = await axios.get('http://localhost:8000/api/processes/');
        const subProcessRes = await axios.get('http://localhost:8000/api/subprocesses/');
        const indicatorRes = await axios.get('http://localhost:8000/api/indicators/');
        const resultRes = await axios.get('http://localhost:8000/api/results/');
        
        setMacroProcesses(macroRes.data);
        setProcesses(processRes.data);
        setSubProcesses(subProcessRes.data);
        setIndicators(indicatorRes.data);
        setResults(resultRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const filteredResults = results.filter(result => {
    return (
      (!selectedMacroProcess || result.macroProcess === parseInt(selectedMacroProcess)) &&
      (!selectedProcess || result.process === parseInt(selectedProcess)) &&
      (!selectedSubProcess || result.subProcess === parseInt(selectedSubProcess)) &&
      (!selectedDate || result.creationDate.startsWith(selectedDate))
    );
  });

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Filtros */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <select 
            value={selectedMacroProcess}
            onChange={e => setSelectedMacroProcess(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Macroprocesos</option>
            {macroProcesses.map(mp => (
              <option key={mp.id} value={mp.id}>{mp.name}</option>
            ))}
          </select>

          <select 
            value={selectedProcess}
            onChange={e => setSelectedProcess(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Procesos</option>
            {processes.map(proc => (
              <option key={proc.id} value={proc.id}>{proc.name}</option>
            ))}
          </select>

          <select 
            value={selectedSubProcess}
            onChange={e => setSelectedSubProcess(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Subprocesos</option>
            {subProcesses.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>

          <input 
            type="month" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        {/* Gráficos */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Resultados por Indicador</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="creationDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calculatedValue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Tendencia de Resultados</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="creationDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calculatedValue" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Distribución de Indicadores</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={filteredResults}
                dataKey="calculatedValue"
                nameKey="creationDate"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {filteredResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
