import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, MapPin, Star, ShieldCheck } from 'lucide-react';
import SmartBookingWidget from './SmartBookingWidget';

export default function ClinicDetail() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // 1. Get Auth Status (Simulated or Real)
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Get Clinic Data
      const { data: clinicData } = await supabase.from('organizations').select('*').eq('id', orgId).single();
      if (clinicData) setClinic(clinicData);
      setLoading(false);
    }
    loadData();
  }, [orgId]);

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading Clinic OS...</div>;
  if (!clinic) return <div className="p-20 text-center">Clinic not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-80 w-full relative bg-slate-900">
         {clinic.banner_url ? (
            <img src={clinic.banner_url} className="w-full h-full object-cover opacity-80" alt="Banner" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-3xl">NO IMAGE</div>
         )}
         <div className="absolute top-6 left-6">
             <button onClick={() => navigate('/clinics')} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-all">
                 <ArrowLeft className="w-4 h-4" /> Back
             </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10 pb-20">
         <div className="flex flex-col lg:flex-row gap-8">
             <div className="flex-1">
                 <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8">
                     <div className="flex justify-between items-start mb-4">
                         <h1 className="text-4xl font-extrabold text-slate-900">{clinic.name}</h1>
                         <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-bold">
                             <Star className="w-4 h-4 fill-current" /> 4.9
                         </div>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500 mb-6 font-medium">
                         <MapPin className="w-5 h-5 text-blue-500" /> {clinic.city}
                         {clinic.is_verified && <span className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs uppercase ml-2"><ShieldCheck className="w-3 h-3"/> Verified</span>}
                     </div>
                     <p className="text-slate-600 leading-relaxed text-lg">{clinic.description}</p>
                 </div>
                 
                 <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                     <h3 className="font-bold text-xl mb-4 text-slate-900">Insurance Accepted</h3>
                     <div className="flex gap-2 flex-wrap">
                         {['Sun Life', 'Manulife', 'Canada Life', 'Blue Cross', 'Green Shield'].map(i => (
                             <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg font-bold text-sm border border-slate-200">{i}</span>
                         ))}
                     </div>
                 </div>
             </div>

             <div className="w-full lg:w-[400px]">
                 <SmartBookingWidget clinic={clinic} user={user} />
             </div>
         </div>
      </div>
    </div>
  );
}