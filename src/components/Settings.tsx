import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Lock, User, Key, Shield } from 'lucide-react';
import QRCode from 'qrcode.react'; // Importación por defecto

const Settings: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [otpSecret, setOtpSecret] = useState<string>('');
  const [otpUri, setOtpUri] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setIs2FAEnabled(response.data.is_2fa_enabled);
    } catch (err) {
      setError('Error al cargar el perfil');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8000/api/users/me/', profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Perfil actualizado correctamente');
      setError('');
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      await axios.post(
        'http://localhost:8000/api/users/change-password/',
        {
          current_password: password.current,
          new_password: password.new,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Contraseña actualizada correctamente');
      setError('');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Error al cambiar la contraseña');
    }
  };

  const handleToggle2FA = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/users/toggle-2fa/',
        { enable_2fa: !is2FAEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIs2FAEnabled(!is2FAEnabled);
      if (!is2FAEnabled) {
        setOtpSecret(response.data.secret || '');
        setOtpUri(response.data.otp_uri || '');
      } else {
        setOtpSecret('');
        setOtpUri('');
      }
      setSuccess(`2FA ${!is2FAEnabled ? 'activado' : 'desactivado'} correctamente`);
      setError('');
    } catch (err) {
      setError('Error al configurar 2FA');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuraciones</h1>
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`py-2 px-4 ${activeTab === 'password' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          Contraseña
        </button>
        <button
          onClick={() => setActiveTab('2fa')}
          className={`py-2 px-4 ${activeTab === '2fa' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          2FA
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Apellido</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Correo</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Teléfono</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded">
            Guardar Cambios
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Contraseña Actual</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nueva Contraseña</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded">
            Cambiar Contraseña
          </button>
        </form>
      )}

      {activeTab === '2fa' && (
        <div className="space-y-4">
          <p>Autenticación en Dos Factores (2FA)</p>
          <button
            onClick={handleToggle2FA}
            className={`py-2 px-4 rounded text-white ${
              is2FAEnabled ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {is2FAEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
          </button>
          {is2FAEnabled && otpUri && (
            <div>
              <p>Escanea este código QR con tu app de autenticación:</p>
              <QRCode value={otpUri} />
              <p>O usa este secreto: {otpSecret}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;