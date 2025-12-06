import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Activity, LayoutGrid, Users, ShieldCheck, Home, Monitor } from 'lucide-react';
import { Footer } from './components/Footer';

// App Modules - Strict Relative Imports
import LandingPage from './apps/www/LandingPage';
import ClinicApp from './apps/clinics/ClinicApp';
import AdminApp from './apps/admin/AdminApp';
import ClinicDashboard from './apps/clinic-os/ClinicDashboard';
import ClaimClinicPage from './apps/clinic-os/ClaimClinicPage';
import PatientDashboard from './apps/clinics/PatientDashboard';

const SimulationBar: React.FC = () => {
  const location = useLocation();
  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-slate-800 text-white' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`;
  };

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800 px-4 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500">Dentistry.Exchange OS</span>
        </div>
        
        <nav className="flex items-center gap-1">
          <Link to="/" className={getLinkClass('/')}>
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WWW</span>
          </Link>
          <Link to="/clinics" className={getLinkClass('/clinics')}>
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clinics</span>
          </Link>
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Dashboard</span>
          </Link>
          <Link to="/clinic-os" className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            location.pathname.startsWith('/clinic-os') 
            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' 
            : 'text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900/20'
          }`}>
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clinic OS</span>
          </Link>
          <Link to="/recruit" className={getLinkClass('/recruit')}>
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recruit</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 mx-2" />
          <Link to="/admin" className={getLinkClass('/admin')}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Super Admin</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // VERSION: 0.0.59 (Checksum 59 -> 5+9=14 -> 14%3=2 -> Red Heartbeat)
  const [version] = useState("0.0.59");

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans">
        {/* Simulation Layout: Top Bar to switch 'Subdomains' */}
        <SimulationBar />

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Micro-Frontend: Clinics Module */}
            <Route path="/clinics/*" element={<ClinicApp />} />
            
            {/* Micro-Frontend: Patient Dashboard (Negotiation Center) */}
            <Route path="/dashboard" element={<PatientDashboard />} />

            {/* Micro-Frontend: Clinic OS (Front Desk) */}
            <Route path="/clinic-os" element={<ClinicDashboard />} />
            <Route path="/clinic-os/claim" element={<ClaimClinicPage />} />
            <Route path="/os" element={<Navigate to="/clinic-os" replace />} />
            
            {/* Micro-Frontend: Recruit Module (Placeholder) */}
            <Route path="/recruit/*" element={
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-12">
                <Users className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-700">Recruitment Portal</h2>
                <p className="text-slate-500">Coming soon in v0.1.0</p>
              </div>
            } />

            {/* Micro-Frontend: Admin Module */}
            <Route path="/admin/*" element={<AdminApp />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer version={version} />
      </div>
    </HashRouter>
  );
};

export default App;