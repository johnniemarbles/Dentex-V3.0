import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, User, X, Sparkles, Plus, Users, MapPin, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// --- STATIC DATA ---
const POPULAR_SERVICES = [
  { id: 'checkup', label: 'Checkup & Clean', icon: '✨', price: 150 },
  { id: 'emergency', label: 'Emergency / Pain', icon: '🚨', price: 80 },
  { id: 'whitening', label: 'Whitening', icon: '💎', price: 299 },
  { id: 'consult', label: 'Free Consult', icon: '📋', price: 0 },
];

const TIME_SLOTS: Record<string, string[]> = {
  Morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['01:00 PM', '02:30 PM', '04:00 PM']
};

// --- WIDGET ---
export default function SmartBookingWidget({ clinic, user }: any) {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const handleAction = () => {
    if (!user) {
      alert("Please login via the top right corner (or simulated auth) to book.");
      return; 
    }
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    navigate('/clinics/success');
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Book Visit</h3>
          {selectedService && <span className="text-[10px] bg-blue-600 px-2 py-1 rounded text-white font-bold">STEP 1 DONE</span>}
        </div>

        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Reason for Visit</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {POPULAR_SERVICES.map(svc => (
            <button 
              key={svc.id}
              onClick={() => setSelectedService(svc)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedService?.id === svc.id 
                ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300'
              }`}
            >
              <div className="text-lg mb-1">{svc.icon}</div>
              <div className="text-xs font-bold">{svc.label}</div>
            </button>
          ))}
        </div>

        {/* AI Assist */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Tell us more (Optional)</label>
            <div className="flex items-center gap-1 text-[10px] text-blue-500">
              <Sparkles className="w-3 h-3" /> AI Assist
            </div>
          </div>
          <textarea 
            value={aiMessage}
            onChange={(e) => setAiMessage(e.target.value)}
            placeholder="Describe your symptoms..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
          />
        </div>

        <button 
          onClick={handleAction}
          className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
            user 
              ? selectedService ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={user && !selectedService}
        >
          {user ? <Calendar className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          {user ? (selectedService ? 'Choose Time' : 'Select Service') : 'Login to Book'}
        </button>
      </div>

      {isModalOpen && (
        <BookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clinic={clinic}
          user={user}
          service={selectedService}
          note={aiMessage}
          onConfirm={handleSuccess}
        />
      )}
    </>
  );
}

// --- WIZARD ---
function BookingModal({ isOpen, onClose, clinic, user, service, note, onConfirm }: any) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedMember, setSelectedMember] = useState('ME');
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     const fetchFam = async () => {
         const { data } = await supabase.from('family_members').select('*').eq('guardian_id', user.id);
         if (data) setFamilyMembers(data);
     };
     fetchFam();
  }, [user.id]);

  const handleConfirm = async () => {
     setLoading(true);
     const patientName = selectedMember === 'ME' ? user.email : familyMembers.find(m => m.id === selectedMember)?.first_name;
     
     // CRITICAL FIX: Save patient_id
     const start_time = new Date(`${date}T${time.split(' ')[0]}:00`).toISOString();
     const { error } = await supabase.from('appointments').insert({
         org_id: clinic.id,
         service_type: service.label,
         start_time: start_time,
         patient_name: patientName,
         patient_email: user.email,
         patient_id: user.id, // <--- ID Saved for RLS
         status: 'PENDING',
         notes: note,
         family_member_id: selectedMember === 'ME' ? null : selectedMember
     });

     setLoading(false);
     if (error) {
       console.error("Booking Error:", error);
       alert("Booking failed: " + error.message);
     } else {
       onConfirm();
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
         {/* LEFT */}
         <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-6 flex flex-col hidden md:flex">
             <h2 className="text-2xl font-bold text-slate-900 mb-2">{clinic.name}</h2>
             <div className="text-sm text-slate-500 mb-6 flex items-center gap-2"><MapPin className="w-4 h-4"/> {clinic.city}</div>
             <div className="space-y-3 flex-1">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <span className="text-[10px] font-bold uppercase text-slate-400">Service</span>
                     <div className="font-bold text-slate-900">{service.label}</div>
                 </div>
                 {time && (
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-left-2">
                         <span className="text-[10px] font-bold uppercase text-slate-400">Time</span>
                         <div className="font-bold text-slate-900">{date}</div>
                         <div className="text-blue-600 font-bold">{time}</div>
                     </div>
                 )}
             </div>
         </div>

         {/* RIGHT */}
         <div className="flex-1 flex flex-col bg-white relative">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
             </div>
             
             <div className="flex-1 p-8 overflow-y-auto">
                 {step === 1 && (
                     <div className="animate-in slide-in-from-right-4">
                         <h3 className="text-2xl font-bold text-slate-900 mb-6">Select a Time</h3>
                         <input type="date" className="w-full p-3 border rounded-xl bg-slate-50 font-bold mb-6" onChange={(e) => setDate(e.target.value)} />
                         {date && Object.entries(TIME_SLOTS).map(([period, slots]) => (
                             <div key={period} className="mb-4">
                                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{period}</h4>
                                 <div className="grid grid-cols-3 gap-2">
                                     {slots.map(t => (
                                         <button key={t} onClick={() => { setTime(t); setStep(2); }} className="py-2 border rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors">{t}</button>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {step === 2 && (
                     <div className="animate-in slide-in-from-right-4">
                         <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-6"><ChevronLeft className="w-4 h-4"/> Back</button>
                         <h3 className="text-2xl font-bold text-slate-900 mb-6">Confirm</h3>
                         
                         <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-200">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Who is this for?</label>
                             <div className="space-y-3">
                                 <button onClick={() => setSelectedMember('ME')} className={`w-full flex items-center gap-3 p-3 rounded-xl border bg-white transition-all ${selectedMember === 'ME' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
                                     <User className="w-5 h-5 text-slate-500"/>
                                     <span className="font-bold text-slate-900">Myself ({user.email})</span>
                                     {selectedMember === 'ME' && <CheckCircle className="ml-auto w-5 h-5 text-blue-600"/>}
                                 </button>
                                 {familyMembers.map(m => (
                                     <button key={m.id} onClick={() => setSelectedMember(m.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border bg-white transition-all ${selectedMember === m.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
                                         <Users className="w-5 h-5 text-slate-500"/>
                                         <span className="font-bold text-slate-900">{m.first_name}</span>
                                         <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{m.relationship}</span>
                                         {selectedMember === m.id && <CheckCircle className="ml-auto w-5 h-5 text-blue-600"/>}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <button onClick={handleConfirm} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                             {loading ? 'Processing...' : 'Confirm Appointment'}
                         </button>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
}