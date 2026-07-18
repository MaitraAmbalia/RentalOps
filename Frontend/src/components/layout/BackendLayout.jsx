import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, LayoutDashboard, ShoppingBag, Calendar, BarChart2, Settings, 
  Search, Bell, LogOut, ChevronDown, User, HelpCircle, MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { vendorService } from '../../api/vendorService';

export default function BackendLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  const [vendorProfile, setVendorProfile] = useState({
    firstName: 'Vendor',
    lastName: 'Admin',
    companyName: 'Lawn & Equipment'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await vendorService.getProfile();
      if (data) setVendorProfile(data);
    } catch (err) {
      console.error("Layout failed to load vendor info:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/vendor/orders?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const menuItems = [
    { name: 'Dashboard Stats', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Quotations & Orders', path: '/vendor/orders', icon: ShoppingBag },
    { name: 'Schedule (Calendar)', path: '/vendor/schedule', icon: Calendar },
    { name: 'Fulfillment List', path: '/vendor/workflows', icon: Calendar },
    { name: 'Rental Products', path: '/vendor/products', icon: Package },
    { name: 'Resolution Disputes', path: '/vendor/queries', icon: HelpCircle },
    { name: 'Ledger Reports', path: '/vendor/reports', icon: BarChart2 },
    { name: 'Vendor Settings', path: '/vendor/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      
      {/* Sidebar Panel */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 shrink-0 hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          <Link to="/vendor/dashboard" className="flex items-center space-x-2.5 px-2">
            <Package className="h-7 w-7 text-primary" />
            <span className="font-extrabold text-xl tracking-tight text-white">RentHub Admin</span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/10"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Exit Workspace</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation bar */}
        <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-45 px-6 flex justify-between items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden sm:block">
            <input
              type="text"
              placeholder="Search quotation ID, client name, phone..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-4 pr-10 py-2 focus:border-primary focus:outline-none transition-colors"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* User profile dropdown & notifications */}
          <div className="flex items-center space-x-4 ml-auto">
            <button className="p-2 text-slate-500 hover:text-slate-250 bg-slate-900 rounded-xl border border-slate-850 hover:bg-slate-800 transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                  {vendorProfile.firstName.slice(0, 1)}
                </div>
                <div className="text-left hidden lg:block text-xs">
                  <span className="font-bold text-slate-200 block leading-tight">{vendorProfile.firstName} {vendorProfile.lastName}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{vendorProfile.companyName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 hidden lg:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-xs text-slate-400">
                  <Link to="/vendor/settings" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-slate-850 hover:text-white transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/vendor/queries" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-slate-850 hover:text-white transition-colors">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Query Disputes</span>
                  </Link>
                  <div className="h-px bg-slate-800 my-1"></div>
                  <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
