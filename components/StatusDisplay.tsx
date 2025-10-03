import React from 'react';
import type { AppStatus } from '../types.ts';

interface StatusDisplayProps {
    status: AppStatus;
}

const StatusItem: React.FC<{ label: string; value: string | number; unit?: string; className?: string }> = ({ label, value, unit, className }) => (
    <div className={`flex flex-col items-center justify-center p-2 sm:p-3 bg-gray-800/50 rounded-lg text-center ${className}`}>
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline">
            <span className="text-lg sm:text-xl font-bold font-mono text-cyan-300">{typeof value === 'number' ? value.toFixed(2) : value}</span>
            {unit && <span className="ml-1 text-xs text-cyan-500">{unit}</span>}
        </div>
    </div>
);

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <StatusItem label="Time" value={formatTime(status.elapsedTime)} className="col-span-1" />
            <StatusItem label="Phase" value={status.phase} className="col-span-1" />
            <StatusItem label="X Carrier" value={status.xCarrierFreq} unit="Hz" />
            <StatusItem label="Y Carrier" value={status.yCarrierFreq} unit="Hz" />
            <StatusItem label="Z Beat" value={status.zBeatFreq} unit="Hz" />
        </div>
    );
};