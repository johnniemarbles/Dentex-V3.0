import React from 'react';
import GoogleClinicSearch from '../../components/onboarding/GoogleClinicSearch';

export default function ClaimClinicPage() {
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