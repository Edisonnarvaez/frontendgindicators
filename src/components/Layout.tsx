import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { BarChart, Users, Building, Briefcase, Activity, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-700 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-semibold">DATAIND</h1>
        </div>
        <nav className="mt-8">
          <Link to="/" className="block py-2 px-4 hover:bg-indigo-600 flex items-center">
            <BarChart className="mr-2" size={20} />
            Dashboard
          </Link>
          <Link to="/users" className="block py-2 px-4 hover:bg-indigo-600 flex items-center">
            <Users className="mr-2" size={20} />
            Users
          </Link>
          <Link to="/companies" className="block py-2 px-4 hover:bg-indigo-600 flex items-center">
            <Building className="mr-2" size={20} />
            Companies
          </Link>
          <Link to="/departments" className="block py-2 px-4 hover:bg-indigo-600 flex items-center">
            <Briefcase className="mr-2" size={20} />
            Departments
          </Link>
          <Link to="/indicators" className="block py-2 px-4 hover:bg-indigo-600 flex items-center">
            <Activity className="mr-2" size={20} />
            Indicators
          </Link>
          <Link to="/macroProcess" className="block py-2 px-4 hover:bg-indigo-600 flex items-center">
            <Activity className="mr-2" size={20} />
            Macro Process
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            <LogOut className="mr-2" size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;