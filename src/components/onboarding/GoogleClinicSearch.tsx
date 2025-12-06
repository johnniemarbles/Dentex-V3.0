import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { searchClinics, ClinicResult } from '../../services/clinicService';
import { Search, MapPin, Loader2, ArrowRight, Database, CloudDownload, CheckCircle } from 'lucide-react';

export default function GoogleClinicSearch() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Toronto');
  const [results, setResults] = useState<ClinicResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults([]);
    setStatus('Searching Dentex Network...');

    try {
      // Call the Client Service
      const data = await searchClinics(query, location);
      setResults(data);
      
      if (data.length === 0) {
        setStatus('No clinics found. Try a broader search term.');
      } else {
        const googleCount = data.filter(r => r.source === 'google').length;
        if (googleCount > 0) {
           setStatus(`Success: Harvested ${googleCount} new clinics via Harvester Engine.`);
        } else {
           setStatus(`Found ${data.length} clinics in our database.`);
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (clinicId: string) => {
    setClaimingId(clinicId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Please log in to claim a clinic.");
        setClaimingId(null);
        return;
    }

    // Link User to Clinic
    await supabase
      .from('organizations')
      .update({ owner_id: user.id, claim_status: 'verified' })
      .eq('id', clinicId);

    // Refresh to enter Dashboard
    window.location.reload();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Claim Your Practice</h2>
        <p className="text-slate-400 text-sm">
          Enter your clinic name. We will auto-detect it from Google Maps.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
          <input
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-emerald-500 transition-all placeholder:text-slate-600"
            placeholder="Clinic Name (e.g. Dental Corner)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="relative w-full md:w-48">
          <MapPin className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
          <input
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-emerald-500 transition-all placeholder:text-slate-600"
            placeholder="City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 min-w-[100px] flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((clinic) => (
          <div key={clinic.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${clinic.source === 'google' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                {clinic.source === 'google' ? <CloudDownload className="w-5 h-5" /> : <Database className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white">{clinic.name}</h3>
                <p className="text-xs text-slate-400">{clinic.address}</p>
              </div>
            </div>

            {!clinic.is_claimed ? (
              <button
                onClick={() => handleClaim(clinic.id)}
                disabled={!!claimingId}
                className="text-sm bg-slate-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {claimingId === clinic.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <>Claim <ArrowRight className="w-4 h-4" /></>}
              </button>
            ) : (
                <div className="text-slate-500 text-xs font-bold uppercase flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                    <CheckCircle className="w-3 h-3" /> Owned
                </div>
            )}
          </div>
        ))}
        
        {status && <p className="text-center text-xs text-slate-500 mt-4 font-mono">{status}</p>}
      </div>
    </div>
  );
}