import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setTokens } from '../store/slices/authSlice';
import axios from 'axios';
import { Lock } from 'lucide-react';

//
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { setUser } from '../store/userSlice';
import { rolePermissions } from '../types/rbac';

//**** */


const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
//****** */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
//**** */
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!username || !password) {
      setError('Todos los campos son obligatorios');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username,
        password,
      });

      if (response.data.message === 'Ingrese su código 2FA' && response.data.user_id) {
        setUserId(response.data.user_id);
        setError('Ingrese su código 2FA');
      } else {
        handleLoginSuccess(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Credenciales incorrectas o servidor no disponible';
      setError(errorMessage);
      console.error('Error en login:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('El código 2FA es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/users/verify_2fa/', {
        user_id: userId,
        otp_code: otp,
      });

      handleLoginSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código 2FA inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (data: any) => {
    const { access, refresh } = data;
    if (access && refresh) {
      dispatch(setTokens({ access, refresh }));
      navigate('/');
    } else {
      setError('No se recibió el token de la API');
    }
  };

  //***** */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { username, password });
      const userData = response.data;

      if (userData.twoFARequired) {
        setTempUser(userData);
        setShow2FA(true);
      } else {
        // Mapear el rol de la API
        const roleName = userData.roleName?.toLowerCase() as 'superUsuario' | 'administrador' | 'lector';
        const userState = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: {
            role: roleName || 'lector',
            permissions: rolePermissions[roleName] || rolePermissions.lector,
          },
        };
        dispatch(setUser(userState));
        navigate('/users');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Credenciales inválidas');
    }
  };


  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/2fa/verify', {
        userId: tempUser.id,
        code: twoFACode,
      });
      const userData = response.data;

      // Mapear el rol de la API
      const roleName = userData.roleName?.toLowerCase() as 'superUsuario' | 'administrador' | 'lector';
      const userState = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: {
          role: roleName || 'lector',
          permissions: rolePermissions[roleName] || rolePermissions.lector,
        },
      };
      dispatch(setUser(userState));
      setShow2FA(false);
      setTempUser(null);
      setTwoFACode('');
      navigateusers');
    } catch (error) {
      console.er('/ror('Error al verificar 2FA:', error);
      alert('Código 2FA inválido');
    }
  };
  //**** */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            src="/assets/logoslogan.png"
            alt="Logo y eslogan"
            className="mx-auto h-25 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Iniciar sesión</h2>
        </div>

        {!userId ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Nombre de usuario</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                  Recordar sesión
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Cargando...' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerify2FA}>
            <div>
              <label htmlFor="otp" className="sr-only">Código 2FA</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Código 2FA"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Verificando...' : 'Verificar 2FA'}
            </button>
          </form>
        )}

        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );

  //** 
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {show2FA ? 'Verificar 2FA' : 'Iniciar Sesión'}
        </h2>
        {!show2FA ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm"
                required
                autoComplete="new-username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm"
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FA} className="space-y-6">
            <div>
              <label htmlFor="twoFACode" className="block text-sm font-medium text-gray-700">
                Código 2FA
              </label>
              <input
                type="text"
                id="twoFACode"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm"
                required
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Verificar
            </button>
          </form>
        )}
      </div>
    </div>
  );
  // */
};

export default Login;