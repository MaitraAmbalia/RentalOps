import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, Package, LogOut, ChevronRight, Menu, X, User } from 'lucide-react';
import { authService } from '../api/authService';

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res && res.type === 'VENDOR') {
        setVendorInfo(res.user);
      } else if (res && res.type === 'CLIENT') {
        navigate('/dashboard');
      } else {
        // Not a vendor or client, logout/redirect
        handleLogout();
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const menuItems = [
    {
      name: 'Orders Dashboard',
      path: '/vendor/dashboard',
      icon: ShoppingBag
    },
    {
      name: 'Products & Fee Structure',
      path: '/vendor/products',
      icon: Package
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-6 shrink-0 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block">RentHub</span>
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">Vendor Center</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Vendor Profile & Logout */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          {vendorInfo && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary font-bold">
                {vendorInfo.firstName[0]}{vendorInfo.lastName[0]}
              </div>
              <div className="overflow-hidden">
                <span className="block text-sm font-bold text-slate-100 truncate">{vendorInfo.companyName}</span>
                <span className="block text-xs text-slate-500 truncate">{vendorInfo.firstName} {vendorInfo.lastName}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all font-semibold text-sm"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <header className="md:hidden bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
            <Store className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block">RentHub</span>
            <span className="text-[10px] font-semibold text-primary tracking-wider uppercase">Vendor Center</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 bg-slate-950 h-full border-r border-slate-800 p-6 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-sm tracking-widest text-primary uppercase">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><X className="h-5 w-5" /></button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-slate-800 pt-6 space-y-4">
              {vendorInfo && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-bold">
                    {vendorInfo.firstName[0]}{vendorInfo.lastName[0]}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-sm font-bold text-slate-100 truncate">{vendorInfo.companyName}</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900 p-6 overflow-y-auto max-w-7xl mx-auto w-full md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
