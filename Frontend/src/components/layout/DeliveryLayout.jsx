import { Outlet, useNavigate } from 'react-router-dom';
import { Package, LogOut } from 'lucide-react';

export default function DeliveryLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-805 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-sm text-white tracking-wider">RentHub Courier Dispatcher</span>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900 rounded-xl border border-slate-850 hover:bg-slate-800 transition-colors"
          title="Exit Workspace"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
