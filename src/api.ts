import axios from 'axios';
import { store } from './store';
import { setTokens, logout } from './store/slices/authSlice';

const api = axios.create({
  baseURL: 'https://gestorindicadores.onrender.com/api/',
});

// Añadir token automáticamente a cada request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intentar refrescar token si recibimos un 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken } = store.getState().auth;

    // Evita loops infinitos
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post('https://gestorindicadores.onrender.com/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;

        // Actualiza Redux y localStorage
        store.dispatch(setTokens({ access: newAccessToken, refresh: refreshToken }));

        // Reintenta la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // No se pudo refrescar: cerrar sesión
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
