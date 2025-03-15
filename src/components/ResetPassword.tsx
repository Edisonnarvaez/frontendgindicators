import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

// Tipos para las respuestas del backend
interface SuccessResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

const ResetPassword: React.FC = () => {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Validaciones
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post<SuccessResponse>(
        `http://127.0.0.1:8000/password-reset-confirm/${userId}/${token}/`,
        { new_password: newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data.message === 'Password updated successfully') {
        setMessage('Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response) {
        const responseData = error.response.data;
        if (error.response.status === 400) {
          setError(responseData.error || 'Error al actualizar la contraseña. El enlace puede ser inválido o haber expirado.');
        } else {
          setError('Error inesperado. Intenta de nuevo.');
        }
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Restablecer contraseña</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Ingresa tu nueva contraseña</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password" className="sr-only">Nueva contraseña</label>
            <input
              id="new-password"
              name="new_password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirmar contraseña</label>
            <input
              id="confirm-password"
              name="confirm_password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            />
          </div>

          {message && (
            <p className="mt-2 text-center text-sm text-green-600">
              {message}{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Inicia sesión aquí
              </Link>
            </p>
          )}
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;