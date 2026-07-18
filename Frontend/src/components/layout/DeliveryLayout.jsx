import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Package, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function DeliveryLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || (role && role !== 'DELIVERY')) {
      navigate('/delivery/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/delivery/login');
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col font-sans transition-colors duration-200">
      <header className="h-16 bg-header-bg border-b border-border-main px-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md transition-colors">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-sm text-text-main tracking-wider">RentHub Courier Dispatcher</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text-main bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          <button 
            onClick={handleLogout}
            className="p-2 text-text-muted hover:text-rose-400 bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors"
            title="Exit Workspace"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
