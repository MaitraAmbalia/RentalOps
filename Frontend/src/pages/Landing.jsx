import { Link } from 'react-router-dom';
import { Package, Shield, Clock, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">RentHub</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/vendor-login" className="text-sm font-medium text-slate-600 hover:text-slate-900">For Vendors</Link>
            <Link to="/partner-login" className="text-sm font-medium text-slate-600 hover:text-slate-900">For Drivers</Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <Link to="/login" className="text-sm font-semibold text-slate-900">Login</Link>
            <Link to="/signup" className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="relative overflow-hidden bg-slate-50 pt-16 sm:pt-24 lg:pt-32 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
              Rent anything you need, <span className="text-primary">anytime.</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              From heavy machinery to high-end cameras. Discover a seamless rental experience with trusted vendors and fast delivery.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/signup" className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all hover:scale-105">
                Get Started
              </Link>
              <Link to="/dashboard" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all">
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Quality</h3>
                <p className="text-slate-600">All our vendors and products are strictly vetted to ensure you get the best equipment.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Delivery</h3>
                <p className="text-slate-600">Choose home delivery or convenient pickup points. Our partners ensure timely arrivals.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Transparent Pricing</h3>
                <p className="text-slate-600">No hidden fees. What you see is what you pay, with clear rules for overdue charges.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
