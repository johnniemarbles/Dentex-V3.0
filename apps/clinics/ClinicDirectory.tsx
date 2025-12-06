import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, ShieldCheck, AlertCircle, Building, Globe } from 'lucide-react';
import { searchClinics, ClinicResult } from '../../services/clinicService';

export default function ClinicDirectory() {
  const [clinics, setClinics] = useState<ClinicResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial load with empty query to get some DB results
    handleSearch(true);
  }, []);

  async function handleSearch(isInitial = false) {
    setLoading(true);
    setError(null);
    try {
      // Use the Harvester Engine!
      const results = await searchClinics(searchTerm, locationTerm);
      setClinics(results);
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      setError(err.message || 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 w-full">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Find Your Dentist</h1>
          <p className="text-slate-500 mt-1">Book appointments with verified professionals or discover new clinics.</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Clinic Name..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <div className="relative w-full md:w-48">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="City (e.g. Toronto)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={locationTerm}
                    onChange={(e) => setLocationTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <button 
                onClick={() => handleSearch()}
                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                Search
            </button>
        </div>
      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
             <p>Scanning directory & external sources...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Unable to load clinics</h3>
          <p className="text-slate-500 mb-4 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => handleSearch()}
            className="text-blue-600 font-semibold hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : clinics.length === 0 ? (
         <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No clinics found</h3>
            <p className="text-slate-500">We checked our database and Google Maps.</p>
         </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clinics.map((clinic) => (
            <div key={clinic.id} title={clinic.name} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                 {/* Since Harvester results might not have image_url, show a nice placeholder */}
                 <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300">
                     <Building className="w-16 h-16 opacity-20" />
                 </div>
                 
                 {/* Badge */}
                 <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                     {clinic.is_claimed ? (
                        <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-teal-700 flex items-center gap-1 shadow-sm border border-teal-100">
                            <ShieldCheck className="w-3 h-3 fill-teal-100" />
                            Verified
                        </div>
                     ) : (
                        <div className="bg-blue-600/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm">
                            <Globe className="w-3 h-3" />
                            Google Listing
                        </div>
                     )}
                 </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="mb-2">
                     <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {clinic.name}
                     </h3>
                </div>
                
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                   {clinic.is_claimed 
                     ? "Providing comprehensive dental care services." 
                     : "This clinic is listed via Google Maps but has not yet claimed their profile on Dentistry.Exchange."}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{clinic.address}</span>
                     </div>
                     <Link to={`/clinics/${clinic.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        View Profile
                     </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}