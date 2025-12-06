import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Database } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Platform Admin</h2>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-600 text-white rounded-md">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Overview</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Tenants</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">Data</span>
            </a>
             <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Configuration</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 bg-white overflow-auto p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Total Clinics</p>
                <p className="text-2xl font-bold text-slate-900">1,248</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Active Bookings</p>
                <p className="text-2xl font-bold text-slate-900">856</p>
            </div>
             <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">New Users (24h)</p>
                <p className="text-2xl font-bold text-emerald-600">+124</p>
            </div>
             <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">System Status</p>
                <p className="text-2xl font-bold text-emerald-600">Healthy</p>
            </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-700">Recent Activity Log</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                        <div>
                            <p className="text-sm font-medium text-slate-900">New clinic registration: "Dental Plus {i}"</p>
                            <p className="text-xs text-slate-500">User ID: #8823{i} • IP: 192.168.1.{i}</p>
                        </div>
                        <span className="text-xs text-slate-400">2m ago</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const AdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminApp;