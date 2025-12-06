import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function ClinicOnboarding() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearchAndClaim = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setError('');

    try {
      // 1. Get Current User (The Owner)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in via Supabase Auth.');

      // 2. Insert new Clinic
      // We assume basic fields. In a real app, 'city' would be dynamic.
      const { data, error: dbError } = await supabase
        .from('organizations')
        .insert({
          name: searchTerm,
          slug: searchTerm.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
          city: 'Toronto', 
          owner_id: user.id, // Links the clinic to YOU
          claim_status: 'verified',
          is_front_runner: false
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Success: Redirect to Dashboard
      navigate('/clinic-os');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to claim clinic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-2xl">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-6 border border-emerald-500/20">
          <Building2 className="w-8 h-8 text-emerald-500" />
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Claim Your Profile</h2>
        <p className="text-slate-400 text-sm">
          Enter your practice name to create your dedicated workspace instantly.
        </p>
      </div>

      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. Yorkville Dental Suite"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* Claim Button */}
        <button
          onClick={handleSearchAndClaim}
          disabled={loading || !searchTerm}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          {loading ? (
              <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
              </>
          ) : (
              <>
                  Create & Claim Clinic 
                  <ArrowRight className="w-4 h-4" />
              </>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mt-4 bg-red-900/20 p-3 rounded-lg border border-red-900/50 text-left">
             <AlertCircle className="w-4 h-4 flex-shrink-0" />
             <span>{error}</span>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500">
              By claiming, you agree to our Terms of Service. <br/>
              Ensure you are logged in before proceeding.
          </p>
      </div>
    </div>
  );
}