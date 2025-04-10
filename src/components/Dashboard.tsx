import React, { useState, useEffect } from 'react';
import api from '../api';
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
    macroProcess: number;
  }

  const [processes, setProcesses] = useState<Process[]>([]);

  interface SubProcess {
    id: number;
    name: string;
    process: number;
  }

  const [subProcesses, setSubProcesses] = useState<SubProcess[]>([]);

  interface Indicator {
    id: number;
    name: string;
    subProcess: number;
    headquarters: number;
  }

  const [indicators, setIndicators] = useState<Indicator[]>([]);

  interface Result {
    macroProcess: number;
    process: number;
    subProcess: number;
    indicator: number;
    headquarters: number;
    creationDate: string;
    calculatedValue: number;
  }

  const [results, setResults] = useState<Result[]>([]);

  interface Department {
    id: number;
    name: string;
  }

  const [departments, setDepartments] = useState<Department[]>([]);

  interface Headquarters {
    id: number;
    name: string;
  }

  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);

  const [selectedMacroProcess, setSelectedMacroProcess] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedSubProcess, setSelectedSubProcess] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [selectedHeadquarters, setSelectedHeadquarters] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const macroRes = await api.get('http://localhost:8000/api/macroprocesses/');
        const processRes = await api.get('http://localhost:8000/api/processes/');
        const subProcessRes = await api.get('http://localhost:8000/api/subprocesses/');
        const indicatorRes = await api.get('http://localhost:8000/api/indicators/');
        const resultRes = await api.get('http://localhost:8000/api/results/');
        const departmentRes = await api.get('http://localhost:8000/api/departments/');
        const headquartersRes = await api.get('http://localhost:8000/api/headquarters/');
        
        setMacroProcesses(macroRes.data);
        setProcesses(processRes.data);
        setSubProcesses(subProcessRes.data);
        setIndicators(indicatorRes.data);
        setResults(resultRes.data);
        setDepartments(departmentRes.data);
        setHeadquarters(headquartersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const filteredProcesses = processes.filter(proc => proc.macroProcess === parseInt(selectedMacroProcess) || selectedMacroProcess === '');
  const filteredSubProcesses = subProcesses.filter(sp => sp.process === parseInt(selectedProcess) || selectedProcess === '');
  const filteredIndicators = indicators.filter(ind => ind.subProcess === parseInt(selectedSubProcess) || selectedSubProcess === '');
  const filteredResults = results.filter(result => {
    return (
      (!selectedMacroProcess || result.macroProcess === parseInt(selectedMacroProcess)) &&
      (!selectedProcess || result.process === parseInt(selectedProcess)) &&
      (!selectedSubProcess || result.subProcess === parseInt(selectedSubProcess)) &&
      (!selectedIndicator || result.indicator === parseInt(selectedIndicator)) &&
      (!selectedHeadquarters || result.headquarters === parseInt(selectedHeadquarters)) &&
      (!selectedDate || result.creationDate.startsWith(selectedDate))
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
            {filteredProcesses.map(proc => (
              <option key={proc.id} value={proc.id}>{proc.name}</option>
            ))}
          </select>

          <select 
            value={selectedSubProcess}
            onChange={e => setSelectedSubProcess(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Subprocesos</option>
            {filteredSubProcesses.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>

          <select 
            value={selectedIndicator}
            onChange={e => setSelectedIndicator(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Indicadores</option>
            {filteredIndicators.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>

          <select 
            value={selectedHeadquarters}
            onChange={e => setSelectedHeadquarters(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Sedes</option>
            {headquarters.map(hq => (
              <option key={hq.id} value={hq.id}>{hq.name}</option>
            ))}
          </select>

          <select 
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Departamentos</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <input 
            type="month" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded p-2"
          />
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
        <div className="bg-white p-6 rounded-lg shadow-md">
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
