import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PortalHeader from './PortalHeader';
import PortalFooter from './PortalFooter';
import { clientService } from '../../api/clientService';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [clientProfile, setClientProfile] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
      return;
    }
    fetchClientProfile();
  }, [navigate, location.pathname, token]);

  const fetchClientProfile = async () => {
    try {
      const data = await clientService.getProfile();
      if (data) setClientProfile(data);
    } catch (err) {
      console.error('Failed to load client profile:', err);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-main font-sans transition-colors duration-200">
      <PortalHeader clientProfile={clientProfile} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  );
}
