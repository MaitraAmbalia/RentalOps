import { Link, useNavigate } from 'react-router-dom';
import { Package, User, LogOut, Settings, History, Heart, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';

export default function PortalHeader() {
  const { cart, wishlist } = useCart();
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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4 font-sans">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 shrink-0">
            <Package className="h-7 w-7 text-blue-600" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900">RentHub</span>
          </Link>

          {/* Nav Links (Products, Terms, About, Contact) */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-650">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Products</Link>
            <span className="hover:text-blue-600 transition-colors cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer">About us</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer">Contact us</span>
          </nav>

          {/* Search Input bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 relative hidden sm:block">
            <input
              type="text"
              placeholder="Search rental gear..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 text-xs border border-transparent rounded-full pl-4 pr-10 py-2.5 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600">
              <Search className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 shrink-0">
            
            {/* Wishlist */}
            <button 
              onClick={() => navigate('/dashboard?tab=wishlist')}
              className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 transition-all relative"
              title="View Wishlist"
            >
              <Heart className="h-5.5 w-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-white animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <Link 
              to="/cart"
              className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-all relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-extrabold text-sm border border-blue-200">
                  C
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-150 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    My Account
                  </div>
                  <span className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer">
                    <User className="h-4 w-4 mr-2 text-slate-455" /> My Profile
                  </span>
                  <Link 
                    to="/orders" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <History className="h-4 w-4 mr-2 text-slate-455" /> My Orders
                  </Link>
                  <span className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer">
                    <Settings className="h-4 w-4 mr-2 text-slate-455" /> Settings
                  </span>
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
      </div>
    </header>
  );
}
