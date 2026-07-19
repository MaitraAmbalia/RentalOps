import { Link } from 'react-router-dom';
import { 
  Package, Shield, Clock, TrendingUp, CheckCircle2, FileText, 
  Truck, Calendar, ArrowRight, Star, Settings 
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* Navbar */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-purple-750 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Package className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              RentalOps<span className="text-purple-700">.</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-sm font-semibold text-slate-650 hover:text-purple-700 transition-colors">Rent Catalog</Link>
            <Link to="/login?role=VENDOR" className="text-sm font-semibold text-slate-650 hover:text-purple-700 transition-colors">Vendor Control</Link>
            <Link to="/login?role=DELIVERY" className="text-sm font-semibold text-slate-650 hover:text-purple-700 transition-colors">Delivery Drivers</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-slate-705 hover:text-slate-950 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="text-sm font-bold bg-purple-700 text-white px-5 py-2.5 rounded-xl hover:bg-purple-800 transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-600/20"
            >
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-white pt-20 pb-24 overflow-hidden border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Rent it<span className="text-purple-700">.</span> <span className="text-teal-500 relative">Track it<span className="absolute left-0 bottom-1 w-full h-2 bg-teal-200/50 -z-10 rounded"></span>.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            RentalOps brings inventory catalogs, real-time scheduling, quotation builders, and digital contract workflows into a single premium experience.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-2xl shadow-xl shadow-purple-600/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <span>Start now - It's free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-750 font-extrabold rounded-2xl border border-slate-200 transition-all hover:scale-[1.02] flex items-center justify-center"
            >
              Browse Catalog
            </Link>
          </div>
          <p className="text-xs text-slate-400 font-medium pt-2">
            Free forever for personal users. Unlimited products.
          </p>
        </div>
      </header>

      {/* Feature 1: Booking & Reservations */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shadow-inner">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Save time, <span className="text-teal-500 underline decoration-teal-300 decoration-3 underline-offset-4">rent online</span>
            </h2>
            <p className="text-sm md:text-base text-slate-655 leading-relaxed font-medium">
              Online booking and reservations have never been easier. Clients can browse category catalogs, pick accurate start and end dates, and complete checkouts instantly on the web.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-455"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-455"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-455"></span>
              </div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Storefront Booking Console</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-teal-600/10 flex items-center justify-center font-bold text-slate-500">
                    Premium Laptop
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">MacBook Pro M3 Max</h4>
                  <p className="text-xs text-slate-500">₹3,500 / day</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider">Select Rental Period</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-center">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase">Start</span>
                      <span className="text-xs font-bold text-slate-800">Nov 6, 2026</span>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-center">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase">End</span>
                      <span className="text-xs font-bold text-slate-800">Nov 9, 2026</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-center space-y-1">
                  <span className="text-[9px] font-extrabold text-purple-400 uppercase">Total Rent Days</span>
                  <span className="block text-sm font-bold text-purple-700">3 Days</span>
                </div>

                <button className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-500/10 transition-all animate-pulse">
                  Instant Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Customizable Pricing */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Settings className="h-4 w-4" />
                <span>Price rule engine</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">vendor_settings.config</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Pricing Model</span>
                  <span className="text-xs font-bold text-slate-200">Duration-Based Multipliers</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Rate Card Config</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-800 text-center">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Hourly</span>
                    <span className="text-xs font-bold text-slate-200">₹450</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-800 text-center">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Weekly</span>
                    <span className="text-xs font-bold text-slate-200">₹2,800</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-800 text-center">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Monthly</span>
                    <span className="text-xs font-bold text-slate-200">₹8,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Time is money... <span className="text-purple-700 italic">literally</span>
            </h2>
            <p className="text-sm md:text-base text-slate-655 leading-relaxed font-medium">
              Create flexible, customizable pricing for every product. Configure dynamic rules for hourly, weekly, monthly, or customized packages, and automate late return penalties on a clean workspace dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 3: Digital E-Signatures */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Signature requests <span className="text-amber-500">on request</span>
            </h2>
            <p className="text-sm md:text-base text-slate-655 leading-relaxed font-medium">
              Upload rental agreements, policy terms, insurance waivers, and custom quotes. Request client e-signatures digitally and receive legally compliant signed agreements before dispatching items.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center space-x-1"><Shield className="h-3.5 w-3.5 text-amber-500" /><span>E-Signature Agreement</span></span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Ready to Sign</span>
            </div>

            <div className="p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
              <h4 className="font-extrabold text-slate-800 text-sm">Rental Terms & Conditions</h4>
              <p className="text-[10px] text-slate-550 leading-relaxed">
                1. Equipment Return: Client agrees to return all rented materials in clean, undamaged condition by the scheduled return time.
              </p>
              <p className="text-[10px] text-slate-550 leading-relaxed border-t border-slate-150 pt-2">
                2. Security Deposit: A refundable deposit will be held and returned only after verification by our warehouse inspection workflow.
              </p>

              <div className="border border-slate-200 bg-white rounded-xl p-3 h-20 flex items-center justify-center relative">
                <span className="absolute top-2 left-2 text-[8px] font-bold text-slate-400 uppercase">Draw Signature Here</span>
                <span className="font-mono text-slate-300 text-xs tracking-wider">[Signature Captured]</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 transition-all">
                Accept & Confirm Order
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Logistics & To-Do List */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-last lg:order-first bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider flex items-center space-x-1.5"><Truck className="h-4 w-4 text-purple-650" /><span>Dispatch Scheduler</span></span>
              <span className="text-[10px] font-bold text-purple-650 bg-purple-100 px-2 py-0.5 rounded">Today's Fleet</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Deco Addict (#SO0023)</span>
                  <span className="text-[10px] text-slate-500">Pick-up: Nov 6, 2026</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[9px] font-bold border border-emerald-500/20">Reserved</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Wood Corner (#SO0024)</span>
                  <span className="text-[10px] text-slate-500">Return: Nov 9, 2026</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded text-[9px] font-bold border border-amber-500/20">Picked Up</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-800 block text-xs">Deco Addict (#SO0021)</span>
                  <span className="text-[10px] text-rose-500">Return: Overdue by 2 days</span>
                </div>
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded text-[9px] font-bold border border-rose-500/20">Late Return</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shadow-inner">
              <Truck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Automate your <span className="text-purple-700 decoration-purple-300 underline underline-offset-4">to-do list</span>
            </h2>
            <p className="text-sm md:text-base text-slate-655 leading-relaxed font-medium">
              Know exactly who is picking up and who is dropping off in one click. Track driver dispatch assignments, vehicle status, and warehouse check-in workflows from a single cohesive command center.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid: "Done Right" */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              All the features <span className="text-purple-700">done right.</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">
              Everything you need to prevent double-bookings, verify returns, and build seamless client quotes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
              <Star className="h-5 w-5 text-amber-500 absolute top-6 right-6" />
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Unavailable days</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Blackout specific weekdays or holidays where pickups and returns cannot be scheduled.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
              <Star className="h-5 w-5 text-amber-500 absolute top-6 right-6" />
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Minimal rental duration</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Set minimum booking time frames per category to protect high-demand inventory.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
              <Star className="h-5 w-5 text-amber-500 absolute top-6 right-6" />
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Invoicing in a flash</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Instantly convert signed quotations and active rental orders into live payment invoices.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
              <Star className="h-5 w-5 text-amber-500 absolute top-6 right-6" />
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Easy quotations & RFQs</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Provide custom RFQ forms for out-of-stock items, allowing clients to request specific categories and vendors to build proposals.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
              <Star className="h-5 w-5 text-amber-500 absolute top-6 right-6" />
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Security Deposit Held</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Collect and manage refundable security deposits automatically, release them after successful check-in.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-3 relative hover:border-purple-300 transition-all">
              <Star className="h-5 w-5 text-amber-500 absolute top-6 right-6" />
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Driver Dispatch App</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Equip couriers with a dedicated layout dashboard for loading, tracking, and confirming deliveries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call-to-action */}
      <footer className="bg-white border-t border-slate-100 py-12 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-purple-700 rounded-lg flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">RentalOps</span>
          </div>
          <p>© 2026 RentalOps Inc. All rights reserved. Premium Rental Management Platform.</p>
        </div>
      </footer>

    </div>
  );
}
