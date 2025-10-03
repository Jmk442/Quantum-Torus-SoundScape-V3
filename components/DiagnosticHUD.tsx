import React from 'react';
import type { AppStatus } from '../types.ts';

interface DiagnosticHUDProps {
    status: AppStatus;
    noiseVolume: number;
    oscillationMode: string;
    oscillationHz: number;
}

const DiagItem: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div>
        <span className="text-gray-400">{label}: </span>
        <span className="text-green-400">{value}</span>
    </div>
);

export const DiagnosticHUD: React.FC<DiagnosticHUDProps> = ({ status, noiseVolume, oscillationMode, oscillationHz }) => {
    const noiseDb = 20 * Math.log10(noiseVolume || 0.00001); // Handle volume being 0 to avoid -Infinity

    return (
        <div 
            className="fixed top-4 right-4 z-[100] p-3 bg-black/70 border border-green-500/50 rounded-lg text-xs font-mono shadow-lg backdrop-blur-sm"
            aria-live="polite"
            role="status"
        >
            <h3 className="text-sm font-bold text-green-300 border-b border-green-500/30 pb-1 mb-2">DIAGNOSTICS</h3>
            <div className="space-y-1">
                <DiagItem label="OSC_MODE" value={oscillationMode} />
                <DiagItem label="PHI_LFO_HZ" value={`${oscillationHz.toFixed(3)} Hz`} />
                <DiagItem label="PHYS_Z_BEAT" value={`${(status.physicalZBeat ?? 0).toFixed(3)} Hz (Breathing)`} />
                <DiagItem label="STABLE_Z_BEAT" value={`${status.zBeatFreq.toFixed(3)} Hz (Corrected)`} />
                <DiagItem label="NOISE_DB" value={`${noiseDb.toFixed(1)} dB`} />
            </div>
        </div>
    );
};
