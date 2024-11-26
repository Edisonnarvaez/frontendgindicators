import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import Layout from './Layout';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

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
  interface Indicator {
    id: number;
    name: string;
  }

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  interface Result {
    macroProcess: number;
    process: number;
    subProcess: number;
    creationDate: string;
    calculatedValue: number;
    indicator: number; // Agregado el campo indicador
  }

  const [results, setResults] = useState<Result[]>([]);
  
  const [selectedMacroProcess, setSelectedMacroProcess] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedSubProcess, setSelectedSubProcess] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState(''); // Filtro para indicador

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
      (!selectedDate || result.creationDate.startsWith(selectedDate)) &&
      (!selectedIndicator || result.indicator === parseInt(selectedIndicator)) // Filtrar por indicador
    );
  });

  // Función para exportar a Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredResults);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    XLSX.writeFile(wb, 'Resultados_Indicadores.xlsx');
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Resultados por Indicador', 14, 16);
    
    const tableData = filteredResults.map((result) => [
      result.macroProcess,
      result.process,
      result.subProcess,
      result.creationDate,
      result.calculatedValue
    ]);
    autoTable(doc, {
      head: [['Macroproceso', 'Proceso', 'Subproceso', 'Fecha', 'Valor Calculado']],
      body: tableData,
      startY: 20,
      theme: 'striped',
    });

    doc.save('Resultados_Indicadores.pdf');
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Filtros */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

          <select 
            value={selectedIndicator}
            onChange={e => setSelectedIndicator(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Indicadores</option>
            {indicators.map(indicator => (
              <option key={indicator.id} value={indicator.id}>{indicator.name}</option>
            ))}
          </select>
        </div>

        {/* Botones de exportación */}
        <div className="mb-8">
          <button
            onClick={exportToExcel}
            className="bg-blue-500 text-white p-2 rounded mr-4"
          >
            Exportar a Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-green-500 text-white p-2 rounded"
          >
            Exportar a PDF
          </button>
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
