import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Shield, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] opacity-20 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
            The Operating System for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Modern Dentistry</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 mb-10">
            Connect clinics, professionals, and patients in one unified ecosystem. 
            Streamlined bookings, verified directories, and simplified recruitment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/clinics" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
              Find a Clinic
              <Search className="w-4 h-4" />
            </Link>
            <Link to="/clinics/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all">
              List Your Practice
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Directory</h3>
              <p className="text-slate-500 leading-relaxed">
                Find verified dental professionals by specialty, location, and insurance acceptance instantly.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Booking</h3>
              <p className="text-slate-500 leading-relaxed">
                Real-time appointment scheduling that syncs directly with clinic practice management software.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Credentials</h3>
              <p className="text-slate-500 leading-relaxed">
                Automated license verification ensures safety and compliance for every listed practitioner.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;