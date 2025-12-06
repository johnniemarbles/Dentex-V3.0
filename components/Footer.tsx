import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

interface FooterProps {
  version: string;
}

export const Footer: React.FC<FooterProps> = ({ version }) => {
  // Versioning Protocol:
  // 1. Calculate Checksum (x + y + z)
  // 2. Determine Heartbeat Color via (Checksum % 3):
  //    - 0: Blue (Stable/Standard)
  //    - 1: Green (Feature/Fresh)
  //    - 2: Red (Hotfix/Admin/Attention)
  
  const { color, label, shadow, glow, checksum } = useMemo(() => {
    // 1. Parse Version (x.y.z)
    const parts = version.split('.').map(Number);
    const x = parts[0] || 0;
    const y = parts[1] || 0;
    const z = parts[2] || 0;
    
    // 2. Calculate Checksum
    const calcChecksum = x + y + z;
    
    // 3. Determine Heartbeat Color
    const remainder = calcChecksum % 3;

    let styles = { 
        color: "text-blue-500", 
        label: "Stable",
        shadow: "shadow-blue-500/20",
        glow: "bg-blue-500/10"
    };

    if (remainder === 1) { // Green
         styles = { 
          color: "text-emerald-500", 
          label: "Feature",
          shadow: "shadow-emerald-500/20",
          glow: "bg-emerald-500/10"
        };
    } else if (remainder === 2) { // Red
        styles = { 
          color: "text-rose-500", 
          label: "Hotfix",
          shadow: "shadow-rose-500/20",
          glow: "bg-rose-500/10"
        };
    }

    return { ...styles, checksum: calcChecksum };
  }, [version]);

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">Dentistry.Exchange</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm ${shadow}`}>
            <span className="text-xs font-mono text-slate-500">v{version}</span>
            <div className="h-3 w-px bg-slate-200 mx-1"></div>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${glow}`}>
                <Activity className={`w-3.5 h-3.5 ${color} animate-pulse`} />
                <span className={`text-[10px] uppercase font-bold tracking-wider ${color}`}>{label}</span>
            </div>
            <div className="h-3 w-px bg-slate-200 mx-1"></div>
            <span className="text-[10px] text-slate-400 opacity-60 font-mono">chk:{checksum}</span>
        </div>

      </div>
    </footer>
  );
};