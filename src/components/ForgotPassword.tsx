import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../api';

// Definir tipos para las respuestas del backend
interface SuccessResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(''); // Limpiar mensajes previos
    setError('');   // Limpiar errores previos

    try {
      const response = await api.post<SuccessResponse>(
        'https://gestorindicadores.onrender.com/password-reset/',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Éxito: usuario encontrado y enlace enviado
      if (response.status === 200 && response.data.message === 'Password reset link sent') {
        setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response) {
        const responseData = error.response.data;
        // Caso: usuario no encontrado
        if (error.response.status === 400 && responseData.error === 'User not found') {
          setError('No se encontró un usuario con este correo. Por favor, regístrate.');
        } else {
          // Otros errores
          setError(responseData.error || 'Error al enviar el correo. Intenta de nuevo.');
        }
      } else {
        setError('Error inesperado. Intenta de nuevo.');
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Recuperar contraseña</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Ingresa tu correo electrónico para recibir un enlace de recuperación</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>

          {message && <p className="mt-2 text-center text-sm text-green-600">{message}</p>}
          {error && (
            <p className="mt-2 text-center text-sm text-red-600">
              {error}
              {error.includes('regístrate') && (
                <span>
                  {' '}
                  <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Regístrate aquí
                  </a>
                </span>
              )}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
          <div className="text-center mt-8">
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Ingresar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;