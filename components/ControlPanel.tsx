import React from 'react';
import type { ChakraPreset } from '../types.ts';

interface ControlPanelProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    duration: number;
    onDurationChange: (duration: number) => void;
    carrierVolume: number;
    onCarrierVolumeChange: (volume: number) => void;
    noiseVolume: number;
    onNoiseVolumeChange: (volume: number) => void;
    torusSpeed: number;
    onTorusSpeedChange: (speed: number) => void;
    backgroundSpeed: number;
    onBackgroundSpeedChange: (speed: number) => void;
    presets: ChakraPreset[];
    selectedPresetId: string;
    onPresetChange: (presetId: string) => void;
    selectedPresetDescription?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    isPlaying,
    onPlayPause,
    duration,
    onDurationChange,
    carrierVolume,
    onCarrierVolumeChange,
    noiseVolume,
    onNoiseVolumeChange,
    torusSpeed,
    onTorusSpeedChange,
    backgroundSpeed,
    onBackgroundSpeedChange,
    presets,
    selectedPresetId,
    onPresetChange,
    selectedPresetDescription,
}) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 w-full">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPlayPause}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white flex items-center justify-center shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"></path></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4.018 14.386A1.723 1.723 0 0 0 6.25 16h7.5a1.723 1.723 0 0 0 2.232-1.614l-1.5-6A1.723 1.723 0 0 0 12.25 7h-4.5A1.723 1.723 0 0 0 5.518 8.386l-1.5 6zM10 4a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 4z" transform="rotate(90 10 10)"></path></svg>
                        )}
                    </button>
                </div>

                <div className="w-full md:w-auto flex-grow flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <label htmlFor="duration" className="flex-shrink-0 w-24 sm:w-28 text-xs sm:text-sm font-medium text-gray-400">Duration</label>
                        <input
                            id="duration"
                            type="range"
                            min="1"
                            max="180"
                            value={duration}
                            onChange={(e) => onDurationChange(Number(e.target.value))}
                            disabled={isPlaying}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="w-14 sm:w-16 text-right font-mono text-cyan-400 text-sm">{duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <label htmlFor="carrierVolume" className="flex-shrink-0 w-24 sm:w-28 text-xs sm:text-sm font-medium text-gray-400">Frequency Vol</label>
                        <input
                            id="carrierVolume"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={carrierVolume}
                            onChange={(e) => onCarrierVolumeChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="w-14 sm:w-16 text-right font-mono text-cyan-400 text-sm">{(carrierVolume * 100).toFixed(0)}%</span>
                    </div>
                     <div className="flex items-center gap-2 sm:gap-4">
                        <label htmlFor="noiseVolume" className="flex-shrink-0 w-24 sm:w-28 text-xs sm:text-sm font-medium text-gray-400">Noise Vol</label>
                        <input
                            id="noiseVolume"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={noiseVolume}
                            onChange={(e) => onNoiseVolumeChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="w-14 sm:w-16 text-right font-mono text-cyan-400 text-sm">{(noiseVolume * 100).toFixed(0)}%</span>
                    </div>
                     <div className="flex items-center gap-2 sm:gap-4">
                        <label htmlFor="torusSpeed" className="flex-shrink-0 w-24 sm:w-28 text-xs sm:text-sm font-medium text-gray-400">Torus Speed</label>
                        <input
                            id="torusSpeed"
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={torusSpeed}
                            onChange={(e) => onTorusSpeedChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="w-14 sm:w-16 text-right font-mono text-cyan-400 text-sm">{torusSpeed.toFixed(1)}x</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <label htmlFor="backgroundSpeed" className="flex-shrink-0 w-24 sm:w-28 text-xs sm:text-sm font-medium text-gray-400">Background Speed</label>
                        <input
                            id="backgroundSpeed"
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={backgroundSpeed}
                            onChange={(e) => onBackgroundSpeedChange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <span className="w-14 sm:w-16 text-right font-mono text-cyan-400 text-sm">{backgroundSpeed.toFixed(1)}x</span>
                    </div>
                </div>
            </div>

            <div className="w-full border-t border-gray-700 pt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <label htmlFor="preset-select" className="flex-shrink-0 w-24 sm:w-28 text-xs sm:text-sm font-medium text-gray-400">Frequency Preset</label>
                    <select
                        id="preset-select"
                        value={selectedPresetId}
                        onChange={(e) => onPresetChange(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                    >
                        <option value="default">Quantum Torus (Default)</option>
                        {presets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name} ({preset.frequency} Hz)
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-center text-xs sm:text-sm text-gray-400 mt-2 h-12 sm:h-10 flex items-center justify-center px-2 sm:px-4">
                     <p className="opacity-80">{selectedPresetDescription || 'Dynamic frequencies based on the golden ratio.'}</p>
                </div>
            </div>
        </div>
    );
};