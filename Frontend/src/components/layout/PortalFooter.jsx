import { Link } from 'react-router-dom';
import { Package, Mail } from 'lucide-react';

export default function PortalFooter() {
  return (
    <footer className="bg-bg-card border-t border-border-main py-10 font-sans transition-colors duration-200 print:hidden text-text-muted text-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 max-w-sm">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-text-main font-sans">RentalOps</span>
            </Link>
            <p className="text-xs leading-relaxed text-text-muted">
              Equipment rental operations platform. Verified gear availability, transparent pricing, and fast deposit returns.
            </p>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <span className="font-semibold text-text-main text-xs uppercase tracking-wider block">Navigation</span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">Explore Equipment</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary transition-colors">My Rentals</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors">Cart & Checkout</Link>
              </li>
              <li>
                <Link to="/account/support" className="hover:text-primary transition-colors">Help & Support</Link>
              </li>
            </ul>
          </div>

          {/* Support Col */}
          <div className="space-y-3">
            <span className="font-semibold text-text-main text-xs uppercase tracking-wider block">Support</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@rentalops.com</span>
              </div>
              <p className="text-text-muted text-xs">
                Have questions or need assistance with your rental orders?
              </p>
              <div>
                <Link to="/account/support" className="text-primary hover:underline font-medium text-xs">
                  Visit Help & Support &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border-main flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} RentalOps. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-xs">
            <Link to="/account/support" className="hover:text-primary transition-colors">Help & Support</Link>
            <span>•</span>
            <span className="text-text-muted">Terms of Service</span>
            <span>•</span>
            <span className="text-text-muted">Privacy Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
