export type Role = 'superUsuario' | 'administrador' | 'lector';

export interface Permission {
  module: string; // Ej: 'users', 'departments'
  read: boolean;
  write: boolean;
}

export interface UserRole {
  role: Role;
  permissions: Permission[];
  restrictions?: {
    sede?: number[]; // IDs de sedes permitidas
    area?: number[]; // IDs de áreas permitidas
  };
}

export interface UserState {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

// Mapa de permisos por rol
export const rolePermissions: Record<Role, Permission[]> = {
  superUsuario: [
    { module: 'users', read: true, write: true },
    { module: 'departments', read: true, write: true },
    { module: 'companies', read: true, write: true },
    { module: 'roles', read: true, write: true },
  ],
  administrador: [
    { module: 'users', read: true, write: true },
    { module: 'departments', read: true, write: true },
    { module: 'companies', read: true, write: true },
    { module: 'roles', read: true, write: false },
  ],
  lector: [
    { module: 'users', read: true, write: false },
    { module: 'departments', read: true, write: false },
    { module: 'companies', read: true, write: false },
    { module: 'roles', read: true, write: false },
  ],
};

// Utilidad para verificar permisos
export const hasPermission = (userRole: UserRole, module: string, action: 'read' | 'write'): boolean => {
  if (userRole.role === 'superUsuario') return true; // SuperUsuario tiene acceso total
  const permission = userRole.permissions.find((p) => p.module === module);
  return permission ? permission[action] : false;
};