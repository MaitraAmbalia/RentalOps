import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, User, LogOut, History, ShoppingCart, Search, Sun, Moon,
  Bell, Heart, ChevronDown, HelpCircle, Settings
} from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function PortalHeader({ clientProfile }) {
  const { cart, wishlist } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlist.length;

  const initials = clientProfile
    ? `${clientProfile.firstName?.[0] || ''}${clientProfile.lastName?.[0] || ''}`.toUpperCase() || 'C'
    : 'C';

  const displayName = clientProfile
    ? `${clientProfile.firstName || ''} ${clientProfile.lastName || ''}`.trim()
    : 'My Account';

  return (
    <header className="bg-header-bg border-b border-border-main sticky top-0 z-50 shadow-sm backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4 font-sans">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
              <Package className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-text-main hidden sm:block">RentHub</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-text-muted">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Products</Link>
            <span className="hover:text-primary transition-colors cursor-pointer">About Us</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 relative hidden sm:block">
            <input
              type="text"
              placeholder="Search rental gear..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-bg-main text-text-main placeholder-text-muted text-xs border border-border-main rounded-xl pl-4 pr-10 py-2 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-text-muted hover:text-primary">
              <Search className="h-4 w-4" />
            </button>
          </form>

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

            {/* Wishlist */}
            <button
              onClick={() => navigate('/dashboard?tab=wishlist')}
              className="p-2 text-text-muted hover:text-rose-500 bg-bg-main rounded-xl border border-border-main hover:bg-bg-card transition-colors relative"
              title="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-bg-card">
                  {wishlistCount}
                </span>
              )}
            </button>

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
