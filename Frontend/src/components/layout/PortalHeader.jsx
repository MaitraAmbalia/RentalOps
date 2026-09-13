import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, User, LogOut, History, ShoppingCart, Search, Sun, Moon,
  Bell, Heart, ChevronDown, HelpCircle, Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { notificationService } from '../../api/notificationService';

export default function PortalHeader({ clientProfile }) {
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { subscribeToNotifications } = useSocket() || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error("PortalHeader failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    const unsubscribe = subscribeToNotifications
      ? subscribeToNotifications((newNotif) => {
          setNotifications((prev) => [newNotif, ...prev]);
        })
      : null;

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, [subscribeToNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const initials = clientProfile
    ? `${clientProfile.firstName?.[0] || ''}${clientProfile.lastName?.[0] || ''}`.toUpperCase() || 'C'
    : 'C';

  const displayName = clientProfile
    ? `${clientProfile.firstName || ''} ${clientProfile.lastName || ''}`.trim()
    : 'My Account';

  return (
    <header className="bg-header-bg border-b border-border-main sticky top-0 z-50 shadow-sm backdrop-blur-md transition-colors duration-200 print:hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4 font-sans relative">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
              <Package className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-text-main hidden sm:block">RentalOps</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-bold text-text-muted bg-bg-main border border-border-main rounded-full px-1.5 py-1.5 shadow-sm absolute left-1/2 -translate-x-1/2">
            <Link to="/dashboard" className="hover:text-primary hover:bg-primary/10 px-4 py-1.5 rounded-full transition-all">Products</Link>
            <Link to="/" className="hover:text-primary hover:bg-primary/10 px-4 py-1.5 rounded-full transition-all">About Us</Link>
            <Link to="/account/support" className="hover:text-primary hover:bg-primary/10 px-4 py-1.5 rounded-full transition-all">Contact</Link>
          </nav>



          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 shrink-0">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-primary bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-text-muted hover:text-primary bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
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



            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-text-muted hover:text-primary bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors relative"
              title="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-bg-card">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-bg-main transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-sm">
                  {initials}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <span className="font-bold text-text-main block leading-tight">{displayName}</span>
                  <span className="text-[10px] text-text-muted font-semibold">Customer Account</span>
                </div>
                <ChevronDown className="h-4 w-4 text-text-muted hidden lg:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-bg-card border border-border-main rounded-xl py-1.5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-xs text-text-muted z-50">
                  <div className="px-4 py-2 border-b border-border-main">
                    <p className="font-extrabold text-text-main text-xs leading-tight">{displayName}</p>
                    {clientProfile?.email && (
                      <p className="text-[10px] text-text-muted truncate font-medium">{clientProfile.email}</p>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 hover:bg-bg-main hover:text-primary transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 hover:bg-bg-main hover:text-primary transition-colors"
                  >
                    <History className="h-4 w-4 mr-2" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/account/support"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 hover:bg-bg-main hover:text-primary transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span>Support</span>
                  </Link>
                  <div className="h-px bg-border-main my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
