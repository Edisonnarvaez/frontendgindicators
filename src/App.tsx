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
//import MacroProcessComponent from './components/MacroProcessComponent';
//import MacroProcessForm from './components/MacroProcessForm';
import PrivateRoute from './components/PrivateRoute';
import Results from './components/Results';
import ResetPassword from './components/ResetPassword';   // El nuevo componente que crearemos
import Settings from './components/Settings';
import UserInitializer from './components/UserInitializer';
import Headquarters from './components/Headquarters';
//import DashboardPage from "./components/Dashboard/DashboardPage";

//**** */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { useRBAC } from './hooks/useRBAC';
import Users from './components/Users';
import Login from './components/Login';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: JSX.Element; module: string }> = ({ children, module }) => {
  const { checkPermission } = useRBAC();
  const user = useSelector((state: RootState) => state.user);

  if (!user.id) {
    return <Navigate to="/login" replace />;
  }

  if (!checkPermission(module, 'read')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App: React.FC = () => {


//** */
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
              {/* <Route path="/Results" element={<PrivateRoute><Results isOpen={true} onClose={() => { }} onSave={() => { }} currentUserId={"1"} /></PrivateRoute>} /> */}
              <Route path="/settings" element={<Settings />} />
              {/* <Route path="/" element={<DashboardPage />} /> */}
              {/* Ruta principal que muestra la lista de MacroProcesos */}
              {/*<Route path="/" element={<MacroProcessComponent />} />*/}
              {/* Ruta para abrir el formulario de nuevo macroproceso */}
              {/* <Route path="/new-macro-process" element={<MacroProcessForm />} /> */}
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

  <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute module="users">
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Acceso Denegado</h1>
                <p>No tienes permisos para acceder a esta página.</p>
              </div>
            </Layout>
          }
        />
        <Route path="/" element={<Navigate to="/users" replace />} />
      </Routes>
    </Router>
  );
}

export default App;