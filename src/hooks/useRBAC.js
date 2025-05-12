import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hasPermission, UserRole } from '../types/rbac';

export const useRBAC = () => {
  const user = useSelector((state: RootState) => state.user);

  const checkPermission = (module: string, action: 'read' | 'write'): boolean => {
    return hasPermission(user.role, module, action);
  };

  const getFilteredData = <T extends { status: boolean }>(data: T[]): T[] => {
    if (user.role.role === 'superUsuario') return data; // SuperUsuario ve todo
    return data.filter((item) => item.status); // Otros solo ven status: true
  };

  return { userRole: user.role, checkPermission, getFilteredData };
};