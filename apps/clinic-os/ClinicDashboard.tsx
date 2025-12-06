import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, CheckCircle, RefreshCw, UserPlus, XCircle } from 'lucide-react';
import GoogleClinicSearch from '../../components/onboarding/GoogleClinicSearch';

export default function ClinicDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);

  useEffect(() => {
    fetchQueue();
    
    // Real-time Subscription
    const channel = supabase
      .channel('clinic-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          fetchQueue(); // Auto-refresh on change
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchQueue() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }

    // 1. Find the clinic owned by this user
    const { data: myClinic } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id) 
      .single();

    if (myClinic) {
      setClinic(myClinic);
      // 2. Fetch Appointments for this clinic
      const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .eq('org_id', myClinic.id)
        .order('created_at', { ascending: false });
      
      setRequests(appts || []);
    }
    setLoading(false);
  }

  const updateStatus = async (id: string, status: string) => {
     await supabase.from('appointments').update({ status }).eq('id', id);
     // UI will update automatically via Realtime, but we can optimistically update too
     setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 bg-slate-950 min-h-screen">Loading Front Desk...</div>;
  
  // THE FIX: If no clinic, render the Onboarding Widget directly
  // This replaces the "No Clinic Found" error text with the solution.
  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 w-full">
           <GoogleClinicSearch />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
       {/* Header */}
       <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
          <div>
             <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Front Desk 
                <span className="flex h-3 w-3 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
             </h1>
             <p className="text-slate-400 text-sm mt-1">Managing: <span className="text-white font-bold">{clinic.name}</span></p>
          </div>
          <button onClick={fetchQueue} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
       </div>

       {/* Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending" value={requests.filter(r => r.status === 'PENDING').length} color="text-orange-400" />
          <StatCard label="Confirmed" value={requests.filter(r => r.status === 'CONFIRMED').length} color="text-emerald-400" />
          <StatCard label="Today" value={0} color="text-white" />
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center items-center cursor-pointer hover:border-emerald-500/50 transition-colors group">
             <UserPlus className="w-6 h-6 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
             <span className="text-xs font-bold text-emerald-500">Walk-In</span>
          </div>
       </div>

       {/* Live Feed */}
       <h3 className="text-lg font-bold text-white mb-4">Live Request Feed</h3>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {requests.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-500 font-medium">No requests found.</p>
              </div>
          )}
          
          {requests.map(req => (
             <div key={req.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white">
                            {req.patient_name ? req.patient_name[0] : 'G'}
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{req.patient_name || 'Guest'}</h4>
                            <p className="text-xs text-slate-400">{req.service_type || 'General Visit'}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                        req.status === 'CONFIRMED' ? 'bg-emerald-900 text-emerald-400' : 
                        req.status === 'CANCELLED' ? 'bg-red-900 text-red-400' :
                        'bg-slate-800 text-slate-300'
                    }`}>
                        {req.status}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-sm text-slate-300 bg-black/20 p-3 rounded-xl mb-4">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {new Date(req.start_time).toLocaleDateString()} 
                    <span className="text-slate-600">|</span> 
                    {new Date(req.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </div>

                 {req.notes && (
                     <div className="mb-4 text-xs text-slate-500 italic border-l-2 border-slate-700 pl-3">
                         "{req.notes}"
                     </div>
                 )}

                 {req.status === 'PENDING' && (
                     <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => updateStatus(req.id, 'CONFIRMED')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                             <CheckCircle className="w-4 h-4" /> Confirm
                         </button>
                         <button onClick={() => updateStatus(req.id, 'CANCELLED')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700">
                             <XCircle className="w-4 h-4" /> Reject
                         </button>
                     </div>
                 )}
             </div>
          ))}
       </div>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
    return (
       <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
       </div>
    );
}