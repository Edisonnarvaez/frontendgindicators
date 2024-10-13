import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Companies from './components/Companies';
import Departments from './components/Departments';
import Indicators from './components/Indicators';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
            <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
            <Route path="/departments" element={<PrivateRoute><Departments /></PrivateRoute>} />
            <Route path="/indicators" element={<PrivateRoute><Indicators /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;