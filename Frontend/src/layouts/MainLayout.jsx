import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Package, User, LogOut, Settings, History } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, clear tokens here
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl tracking-tight text-slate-900">RentHub</span>
            </Link>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rentals..."
                  className="w-full bg-slate-100 text-sm border-transparent rounded-full pl-4 pr-10 py-2 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <div className="absolute right-3 top-2.5 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  JD
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-1 overflow-hidden">
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Link>
                  <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                    <History className="h-4 w-4 mr-2" /> Order History
                  </Link>
                  <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
