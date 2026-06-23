import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LogOut, User as UserIcon, LayoutDashboard, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface-900 shadow-lg shadow-surface-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-brand-500 text-white p-1.5 rounded-lg shadow-md shadow-brand-500/30">
            <Shield size={20} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">CitizenServe</span>
            <span className="hidden sm:inline text-xs text-indigo-300 ml-2 font-medium">Public Services Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Citizen Nav Links */}
              {user.role === 'citizen' && (
                <div className="hidden sm:flex items-center gap-1 mr-2">
                  <Link to="/dashboard"
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition ${isActive('/dashboard') ? 'bg-brand-500/20 text-white' : 'text-indigo-200 hover:bg-surface-800 hover:text-white'}`}>
                    <LayoutDashboard size={15}/> Requests
                  </Link>
                  <Link to="/profile"
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition ${isActive('/profile') ? 'bg-brand-500/20 text-white' : 'text-indigo-200 hover:bg-surface-800 hover:text-white'}`}>
                    <UserIcon size={15}/> Profile
                  </Link>
                </div>
              )}

              <div className="hidden sm:flex items-center gap-2 bg-surface-800 px-3 py-1.5 rounded-xl border border-surface-700">
                <div className="bg-brand-500/20 p-1 rounded-md">
                  <UserIcon size={13} className="text-brand-300" />
                </div>
                <span className="text-sm font-semibold text-white">{user.name.split(' ')[0]}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-600/30 text-xs text-indigo-200 capitalize font-medium">{user.role}</span>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-300 hover:text-rose-300 transition px-3 py-2 rounded-xl hover:bg-surface-800">
                <LogOut size={15}/>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-indigo-200 hover:text-white transition px-3 py-2 rounded-xl hover:bg-surface-800">
                Sign in
              </Link>
              <Link to="/register" className="text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition shadow-md shadow-brand-500/30 flex items-center gap-1">
                Get Started <ChevronRight size={15}/>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
