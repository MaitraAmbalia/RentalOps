import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, LayoutDashboard, ShoppingBag, Calendar, BarChart2, Settings,
  Search, Bell, LogOut, ChevronDown, User, HelpCircle, MessageSquare, Sun, Moon,
  ChevronLeft, Menu, FileText, ChevronRight, Sliders, Truck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { vendorService } from '../../api/vendorService';
import { notificationService } from '../../api/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';

export default function BackendLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { subscribeToNotifications } = useSocket() || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [configOpen, setConfigOpen] = useState(() => {
    const path = window.location.pathname;
    return path.startsWith('/vendor/settings') || path.startsWith('/vendor/user') || path.startsWith('/vendor/quotation');
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  
  const [vendorProfile, setVendorProfile] = useState({
    firstName: 'Vendor',
    lastName: 'Admin',
    companyName: 'Lawn & Equipment',
    role: 'ADMIN',
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || (role && role !== 'VENDOR')) {
      navigate(`/login?role=vendor&redirectTo=${encodeURIComponent(location.pathname)}`);
      return;
    }
    fetchProfile();
    fetchNotifications();
  }, [location.pathname, token, role]);


  // Auto-expand config section when on a config route
  useEffect(() => {
    if (
      location.pathname.startsWith('/vendor/settings') ||
      location.pathname.startsWith('/vendor/user') ||
      location.pathname.startsWith('/vendor/quotation')
    ) {
      setConfigOpen(true);
    }
  }, [location.pathname]);

  const fetchProfile = async () => {
    try {
      const data = await vendorService.getProfile();
      if (data) setVendorProfile(data);
    } catch (err) {
      console.error("Layout failed to load vendor info:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login?role=vendor');
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error("Layout failed to load notifications:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToNotifications
      ? subscribeToNotifications((newNotif) => {
          setNotifications((prev) => [newNotif, ...prev]);
        })
      : null;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToNotifications]);

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

  const isAdmin = vendorProfile.role === 'ADMIN';
  const menuItems = [
    { name: 'Dashboard Stats', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Quotations Proposal', path: '/vendor/quotations', icon: FileText },
    { name: 'Orders & Rentals', path: '/vendor/orders', icon: ShoppingBag },
    { name: 'Schedule (Calendar)', path: '/vendor/schedule', icon: Calendar },
    { name: 'Fulfillment List', path: '/vendor/workflows', icon: Truck },
    { name: 'Rental Products', path: '/vendor/products', icon: Package },
    { name: 'Resolution Disputes', path: '/vendor/queries', icon: HelpCircle },
    { name: 'Ledger Reports', path: '/vendor/reports', icon: BarChart2 },
  ];

  const configItems = [
    { name: 'Setting', path: '/vendor/settings', icon: Sliders, adminOnly: true },
    { name: 'User Profile', path: '/vendor/user', icon: User, adminOnly: false },
    { name: 'Quotation Templates', path: '/vendor/quotation-templates', icon: FileText, adminOnly: true },
  ].filter(item => !item.adminOnly || isAdmin);

  const isConfigActive = configItems.some(item => location.pathname.startsWith(item.path));

  if (!token || (role && role !== 'VENDOR')) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-bg-main text-text-main font-sans transition-colors duration-200">
      
      {/* Sidebar Panel */}
      <aside 
        className={`bg-bg-card border-r border-border-main shrink-0 hidden md:flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20 p-4' : 'w-64 p-6'
        }`}
      >
        <div className="space-y-6">
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-4' : 'justify-between'} px-1`}>
            <Link to="/vendor/dashboard" className="flex items-center space-x-2.5">
              <Package className="h-7 w-7 text-primary shrink-0" />
              {!isCollapsed && (
                <span className="font-extrabold text-xl tracking-tight text-text-main select-none">
                  RentalOps Admin
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-1.5 rounded-lg hover:bg-bg-main text-text-muted hover:text-text-main transition-colors border border-border-main/50"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center' : 'space-x-3'
                  } px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                      : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}

            {/* Configuration Group */}
            {configItems.length > 0 && (
              <div>
                <button
                  onClick={() => !isCollapsed && setConfigOpen(v => !v)}
                  title={isCollapsed ? 'Configuration' : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isConfigActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <Settings className="h-4.5 w-4.5 shrink-0" />
                    {!isCollapsed && <span>Configuration</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${configOpen ? 'rotate-90' : ''}`}
                    />
                  )}
                </button>

                {/* Sub-items */}
                {(configOpen || isCollapsed) && (
                  <div className={`mt-1 ${isCollapsed ? 'space-y-1' : 'ml-4 space-y-1 border-l border-border-main pl-3'}`}>
                    {configItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = location.pathname.startsWith(item.path);
                      return (
                        <Link
                          key={idx}
                          to={item.path}
                          title={isCollapsed ? item.name : undefined}
                          className={`flex items-center ${
                            isCollapsed ? 'justify-center' : 'space-x-2.5'
                          } px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive 
                              ? 'bg-primary text-white' 
                              : 'text-text-muted hover:bg-bg-main hover:text-text-main'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          title={isCollapsed ? "Exit Workspace" : undefined}
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          } px-3 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/10`}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!isCollapsed && <span>Exit Workspace</span>}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation bar */}
        <header className="h-16 bg-header-bg border-b border-border-main backdrop-blur-md sticky top-0 z-45 px-6 flex justify-end items-center gap-4 transition-colors">

          {/* User profile dropdown & notifications */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text-main bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-text-muted hover:text-text-main bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-border-main rounded-2xl py-3 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <div className="px-4 pb-2 border-b border-border-main flex justify-between items-center text-text-main">
                    <span className="font-extrabold text-sm">Notifications</span>
                    <button 
                      onClick={async () => {
                        try {
                          await Promise.all(notifications.filter(n => !n.isRead).map(n => notificationService.markAsRead(n.id)));
                          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border-main">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-text-muted font-medium">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={async () => {
                            if (!n.isRead) {
                              await notificationService.markAsRead(n.id);
                              setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                            }
                          }}
                          className={`p-3 hover:bg-bg-main cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-text-main">{n.title || n.type?.replace('_', ' ')}</span>
                            <span className="text-[9px] text-text-muted font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-text-muted leading-relaxed font-medium">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-bg-main transition-colors"
              >
                {vendorProfile.companyLogo ? (
                  <img src={vendorProfile.companyLogo} alt="logo" className="w-8 h-8 rounded-lg object-cover border border-border-main" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                    {(vendorProfile.firstName || 'V').slice(0, 1)}
                  </div>
                )}
                <div className="text-left hidden lg:block text-xs">
                  <span className="font-bold text-text-main block leading-tight">{vendorProfile.firstName} {vendorProfile.lastName}</span>
                  <span className="text-[10px] text-text-muted font-semibold">{vendorProfile.companyName}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-text-muted hidden lg:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-bg-card border border-border-main rounded-xl py-1.5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-xs text-text-muted">
                  <Link to="/vendor/user" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-bg-main hover:text-text-main transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    <span>My Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link to="/vendor/settings" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-bg-main hover:text-text-main transition-colors">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </Link>
                  )}
                  <Link to="/vendor/queries" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-bg-main hover:text-text-main transition-colors">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Query Disputes</span>
                  </Link>
                  <div className="h-px bg-border-main my-1"></div>
                  <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors">
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
