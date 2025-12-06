import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ChevronRight, ChevronLeft, User, X, Sparkles, Users, MapPin, LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// --- STATIC DATA (Simulating V 2.1 Logic) ---
const POPULAR_SERVICES = [
  { id: 'checkup', label: 'Checkup & Clean', icon: '✨', price: 150 },
  { id: 'emergency', label: 'Emergency / Pain', icon: '🚨', price: 80 },
  { id: 'whitening', label: 'Whitening', icon: '💎', price: 299 },
  { id: 'consult', label: 'Free Consult', icon: '📋', price: 0 },
];

const TIME_SLOTS: Record<string, string[]> = {
  Morning: ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['01:00 PM', '01:30 PM', '02:30 PM', '04:00 PM'],
  Evening: ['05:30 PM', '06:30 PM']
};

// --- WIDGET COMPONENT (The Trigger) ---
export function BookingWidget({ clinic, user }: any) {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleAction = () => {
    if (!user) {
      // In a real app, this would redirect to /login
      alert("DEMO MODE: Please pretend you just logged in or use Supabase Auth.");
      return; 
    }
    setIsModalOpen(true);
  };

  if (bookingSuccess) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Request Sent!</h3>
        <p className="text-slate-500 mt-2 text-sm">The clinic will confirm shortly.</p>
        <button onClick={() => setBookingSuccess(false)} className="mt-6 text-blue-600 text-sm font-bold hover:underline">Book Another</button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Book Visit</h3>
          {selectedService && <span className="text-[10px] bg-blue-600 px-2 py-1 rounded text-white font-bold">STEP 1 DONE</span>}
        </div>

        {/* 1. Service Selection */}
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

        {/* 2. AI Assist */}
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

        {/* 3. Action Button */}
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
          {user ? (selectedService ? 'Choose Time & Provider' : 'Select a Service First') : 'Login to Book'}
        </button>
      </div>

      {/* THE WIZARD MODAL */}
      {isModalOpen && (
        <SmartBookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clinic={clinic}
          user={user}
          service={selectedService}
          note={aiMessage}
          onConfirm={() => { setBookingSuccess(true); setIsModalOpen(false); }}
        />
      )}
    </>
  );
}

// --- WIZARD MODAL COMPONENT (The 4-Step Flow) ---
function SmartBookingModal({ isOpen, onClose, clinic, user, service, note, onConfirm }: any) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('ME');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     // Fetch Family Members on Mount
     const loadFamily = async () => {
         const { data } = await supabase.from('family_members').select('*').eq('guardian_id', user.id);
         if (data) setFamilyMembers(data);
     };
     loadFamily();
  }, [user.id]);

  const handleConfirm = async () => {
     setLoading(true);
     const patientName = selectedMember === 'ME' ? user.email : familyMembers.find(m => m.id === selectedMember)?.first_name;
     
     const { error } = await supabase.from('appointments').insert({
         org_id: clinic.id,
         service_type: service.label, // Using label as per port request, can be id
         start_time: new Date(`${date}T${time.split(' ')[0]}:00`).toISOString(),
         patient_name: patientName,
         patient_email: user.email,
         status: 'PENDING',
         notes: note
     });

     setLoading(false);
     if (error) alert(error.message);
     else onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
         
         {/* LEFT PANEL: Context & Summary */}
         <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
             <h2 className="text-2xl font-bold text-slate-900 mb-2">{clinic.name}</h2>
             <div className="text-sm text-slate-500 mb-6 flex items-center gap-2"><MapPin className="w-4 h-4"/> {clinic.city}</div>
             
             <div className="space-y-4 flex-1">
                 <div className="bg-white p-4 rounded-xl border border-slate-100">
                     <span className="text-[10px] font-bold uppercase text-slate-400">Service</span>
                     <div className="font-bold text-slate-900">{service.label}</div>
                 </div>
                 {date && (
                     <div className="bg-white p-4 rounded-xl border border-slate-100 animate-in slide-in-from-left-2">
                         <span className="text-[10px] font-bold uppercase text-slate-400">Time</span>
                         <div className="font-bold text-slate-900">{date} @ {time}</div>
                     </div>
                 )}
             </div>
         </div>

         {/* RIGHT PANEL: The Steps */}
         <div className="flex-1 flex flex-col bg-white relative">
             <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
             
             <div className="flex-1 p-8 overflow-y-auto">
                 {/* STEP 1: DATE & TIME */}
                 {step === 1 && (
                     <div className="animate-in slide-in-from-right-4">
                         <h3 className="text-2xl font-bold text-slate-900 mb-6">Select a Time</h3>
                         <div className="mb-6">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Date</label>
                             <input type="date" className="w-full p-3 border rounded-xl bg-slate-50 font-bold" onChange={(e) => setDate(e.target.value)} />
                         </div>
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

                 {/* STEP 2: FAMILY & CONFIRM */}
                 {step === 2 && (
                     <div className="animate-in slide-in-from-right-4">
                         <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-6"><ChevronLeft className="w-4 h-4"/> Back</button>
                         <h3 className="text-2xl font-bold text-slate-900 mb-6">Who is this for?</h3>
                         
                         <div className="space-y-3 mb-8">
                             <button onClick={() => setSelectedMember('ME')} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedMember === 'ME' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                                 <User className="w-5 h-5 text-slate-500"/>
                                 <span className="font-bold text-slate-900">Myself</span>
                                 {selectedMember === 'ME' && <CheckCircle className="ml-auto w-5 h-5 text-blue-600"/>}
                             </button>
                             {familyMembers.map(m => (
                                 <button key={m.id} onClick={() => setSelectedMember(m.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedMember === m.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                                     <Users className="w-5 h-5 text-slate-500"/>
                                     <span className="font-bold text-slate-900">{m.first_name} {m.last_name}</span>
                                     <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 uppercase">{m.relationship}</span>
                                     {selectedMember === m.id && <CheckCircle className="ml-auto w-5 h-5 text-blue-600"/>}
                                 </button>
                             ))}
                             <button className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50">+ Add Family Member</button>
                         </div>

                         <button onClick={handleConfirm} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
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