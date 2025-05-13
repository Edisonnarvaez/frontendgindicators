import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Companies from './components/Companies';
import Departments from './components/Departments';
import Indicators from './components/Indicators';
import MacroProcess from './components/MacroProcess';
import Process from './components/Process';
import SubProcess from './components/SubProcess';
import PrivateRoute from './components/PrivateRoute';
import Results from './components/Results';
import ResetPassword from './components/ResetPassword'; 
import Settings from './components/Settings';
import UserInitializer from './components/UserInitializer';
import Headquarters from './components/Headquarters';
import About from './components/About'; 

function App() {
  return (
    <Provider store={store}>
      <Router>
        <UserInitializer>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/password-reset" element={<ForgotPassword />} />
              <Route path="/password-reset-confirm/:userId/:token" element={<ResetPassword />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
              <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
              <Route path="/headquarters" element={<PrivateRoute><Headquarters /></PrivateRoute>} />
              <Route path="/departments" element={<PrivateRoute><Departments /></PrivateRoute>} />
              <Route path="/indicators" element={<PrivateRoute><Indicators /></PrivateRoute>} />
              <Route path="/macroprocess" element={<PrivateRoute><MacroProcess /></PrivateRoute>} />
              <Route path="/process" element={<PrivateRoute><Process /></PrivateRoute>} />
              <Route path="/subprocess" element={<PrivateRoute><SubProcess /></PrivateRoute>} />
              <Route path="/Results" element={<PrivateRoute><Results /></PrivateRoute>} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/acerca-de" element={<About />} />
            </Routes>
          </div>
        </UserInitializer>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Provider>
  );
}

export default App;