import React, { useState, useEffect, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Lock, User, Key, Shield } from 'lucide-react';
import QRCode from 'qrcode.react';
import api from '../api';

import { useDispatch } from 'react-redux';
import { setUserProfile } from '../store/slices/userSlice';
// Interfaces ajustadas al JSON recibido
interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string | null;
  company: number | null;
  department: number | null;
  role: number | null;
  status: boolean;
  creationDate: string;
  updateDate: string;
  lastLogin: string | null;
  is_2fa_enabled?: boolean; // Opcional, ya que no aparece en tu JSON
}

interface Password {
  current: string;
  new: string;
  confirm: string;
}

const Settings: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [activeTab, setActiveTab] = useState<'perfil' | 'contraseña' | '2fa'>('perfil');
  const [profile, setProfile] = useState<Profile>({
    id: 0,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    company: null,
    department: null,
    role: null,
    status: true,
    creationDate: '',
    updateDate: '',
    lastLogin: null,
    is_2fa_enabled: false, // Valor por defecto
  });
  const [password, setPassword] = useState<Password>({
    current: '',
    new: '',
    confirm: '',
  });
  const [otpSecret, setOtpSecret] = useState<string>('');
  const [otpUri, setOtpUri] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading2FA, setLoading2FA] = useState(false);
  const dispatch = useDispatch();


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    //console.log('Token:', token);
    try {
      const response = await api.get<Profile>('/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({ ...response.data, is_2fa_enabled: response.data.is_2fa_enabled ?? false });
      dispatch(setUserProfile(response.data)); // 👈 Aquí lo guardas en Redux
    } catch (err: any) {
      console.error('Error:', err.response?.data);
      setError('Error al cargar el perfil');
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(
        '/users/me/',
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setSuccess('Perfil actualizado correctamente');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (password.new.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      await api.post(
        '/users/change_password/',
        {
          current_password: password.current,
          new_password: password.new,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Contraseña actualizada correctamente');
      setError('');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    }
  };

  const handleToggle2FA = async () => {
    setLoading2FA(true);
    try {
      const response = await api.post(
        '/users/2fa/toggle/',
        { enable_2fa: !profile.is_2fa_enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === '2FA desactivado') {
        setProfile({ ...profile, is_2fa_enabled: false });
        setOtpSecret('');
        setOtpUri('');
        setSuccess('2FA desactivado correctamente');
        await fetchProfile();
      } else if (response.data.message === '2FA activado') {
        setProfile({ ...profile, is_2fa_enabled: true });
        setOtpSecret(response.data.secret || '');
        setOtpUri(response.data.otp_uri || '');
        setSuccess('2FA activado correctamente');
      }

      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al configurar 2FA');
    } finally {
      setLoading2FA(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <Shield className="mr-2" /> Configuraciones
        </h1>

        <div className="flex space-x-4 border-b mb-6">
          {['perfil', 'contraseña', '2fa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'perfil' | 'contraseña' | '2fa')}
              className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
                }`}
            >
              {tab === 'perfil' && <User className="inline mr-1" size={16} />}
              {tab === 'contraseña' && <Lock className="inline mr-1" size={16} />}
              {tab === '2fa' && <Key className="inline mr-1" size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>
        )}

        {activeTab === 'perfil' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="py-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Guardar Cambios
            </button>
            <div className="text-center mt-8">
              <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Volver
              </a>
            </div>
          </form>
        )}

        {activeTab === 'contraseña' && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Cambiar Contraseña
            </button>
            <div className="text-center mt-8">
              <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Volver
              </a>
            </div>
          </form>
        )}

        {activeTab === '2fa' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Autenticación en Dos Factores (2FA)
            </h2>
            <button
              onClick={handleToggle2FA}
              disabled={loading2FA}
              className={`py-2 px-6 rounded-lg text-white flex items-center justify-center gap-2 transition-colors
    ${profile.is_2fa_enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
    ${loading2FA ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading2FA && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {loading2FA
                ? profile.is_2fa_enabled ? 'Desactivando...' : 'Activando...'
                : profile.is_2fa_enabled ? 'Desactivar 2FA' : 'Activar 2FA'}
            </button>

            {profile.is_2fa_enabled && otpUri && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Escanea este código QR con tu app de autenticación:
                </p>
                <div className="flex justify-center">
                  <QRCode value={otpUri} size={150} />
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  O usa este secreto: <span className="font-mono">{otpSecret}</span>
                </p>
              </div>
            )}
            <div className="text-center mt-8">
              <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Volver
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings