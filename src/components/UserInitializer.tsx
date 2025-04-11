import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUserProfile } from '../store/slices/userSlice';
import api from '../api';

const UserInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (token && !user) {
          const res = await api.get('/users/me/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch(setUserProfile(res.data));
        }
      } catch (err) {
        console.error('Error al cargar el perfil del usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, user, dispatch]);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Cargando perfil de usuario...</div>;
  }

  return <>{children}</>;
};

export default UserInitializer;
