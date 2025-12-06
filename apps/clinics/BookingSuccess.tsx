import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function BookingSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100 animate-in zoom-in duration-500">
          <CheckCircle size={48} className="text-green-600" />
       </div>
       <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Request Sent!</h1>
       <p className="text-slate-500 max-w-md mb-10 text-lg">
         Your appointment request has been securely transmitted. The clinic will review it and send a confirmation shortly.
       </p>
       <div className="flex gap-4">
          <button 
            onClick={() => navigate('/clinics')} 
            className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-white hover:shadow-md transition-all"
          >
            Back to Directory
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2 transition-all"
          >
            View Dashboard <ArrowRight className="w-4 h-4" />
          </button>
       </div>
    </div>
  );
}