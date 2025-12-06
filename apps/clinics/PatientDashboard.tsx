import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { MapPin, RefreshCw, Calendar, Clock, ChevronRight, Activity, AlertCircle } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) await fetchBookings(user.id);
      else setLoading(false);
    }
    init();
  }, []);

  async function fetchBookings(userId: string) {
    setLoading(true);
    setError(null);
    
    try {
        // Fetching by patient_id to respect RLS
        // We use !inner or safe join. If relationship fails, check your DB keys.
        const { data, error } = await supabase
          .from('appointments')
          .select(`*, organizations ( name, address, city )`)
          .eq('patient_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);

    } catch (err: any) {
        console.error("Dashboard Data Error:", err);
        setError(err.message || JSON.stringify(err));
    } finally {
        setLoading(false);
    }
  }

  if (!user && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Member Access Only</h2>
        <p className="text-slate-500 mb-6">Please sign in to view your appointments.</p>
        <button onClick={() => navigate('/clinics')} className="text-blue-600 font-bold underline">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 p-8 min-h-screen">
        <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">Negotiation Center</h1>
            <p className="text-slate-500 mt-2">Manage your active treatments and appointments.</p>
          </div>
          <button onClick={() => user && fetchBookings(user.id)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
             <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error State */}
        {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-sm">Unable to load appointments</h3>
                    <p className="text-xs mt-1 opacity-90">{error}</p>
                    <p className="text-xs mt-2 text-red-500">Dev Note: Ensure 'organizations' foreign key exists in 'appointments' table.</p>
                </div>
            </div>
        )}

        {/* List */}
        <div className="space-y-6">
           {bookings.length === 0 && !loading && !error && (
               <div className="p-16 text-center border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
                   <h3 className="text-xl font-bold text-slate-900">No active appointments</h3>
                   <p className="text-slate-500 mt-2 mb-6">You haven't booked any visits yet.</p>
                   <button onClick={() => navigate('/clinics')} className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all">
                       Find a Dentist <ChevronRight className="w-4 h-4" />
                   </button>
               </div>
           )}

           {bookings.map(booking => (
              <div key={booking.id} className="rounded-2xl border border-slate-200 p-8 hover:shadow-lg bg-white transition-all group">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                     <div>
                         <div className="flex items-center gap-3 mb-3">
                             <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                               booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                               booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                               'bg-slate-100 text-slate-600'
                             }`}>
                                 {booking.status}
                             </span>
                             <span className="text-sm text-slate-500 flex items-center gap-1 font-medium">
                                 <Clock className="w-4 h-4" /> {new Date(booking.start_time).toLocaleDateString()} at {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                         </div>
                         <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{booking.organizations?.name || 'Unknown Clinic'}</h3>
                         <div className="flex items-center gap-2 text-slate-500 mb-4">
                            <MapPin className="w-4 h-4" /> {booking.organizations?.address}, {booking.organizations?.city}
                         </div>
                         <div className="bg-slate-50 px-4 py-2 rounded-lg inline-block">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Service</span>
                            <span className="font-medium text-slate-900">{booking.service_type || 'General Visit'}</span>
                         </div>
                     </div>
                     
                     <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">
                            Reschedule
                        </button>
                        <button className="px-6 py-2 bg-white border border-slate-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 hover:border-rose-100 transition-colors text-sm">
                            Cancel
                        </button>
                     </div>
                 </div>
              </div>
           ))}
        </div>
    </div>
  );
}