// FIX: Replaced placeholder content with the main application component.
// This component orchestrates the entire application, managing state,
// controlling the sound engine, and rendering all UI elements.

import React, from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel.tsx';
import { Visualization } from './components/Visualization.tsx';
import { StatusDisplay } from './components/StatusDisplay.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { SpiralStudiosModal } from './components/SpiralStudiosModal.tsx';
import { DiagnosticHUD } from './components/DiagnosticHUD.tsx';
import { useAnimationFrame } from './hooks/useAnimationFrame.ts';
import { SoundEngine } from './services/soundEngine.ts';
import type { AppStatus, ChakraPreset, NoiseType } from './types.ts';
import { logoSrc } from './assets/logo.png.ts';

// --- Constants ---
const DEFAULT_DURATION_MIN = 30;
const BASE_CARRIER_FREQ = 136.1; // Om, C#3
const SCHUMANN_RESONANCE = 7.83; // Earth's resonance
const OSCILLATION_MODE = 'breathing';
const OSCILLATION_HZ = 0.05; // ~20 second cycle for a slow "breath"
const OSCILLATION_AMPLITUDE = 0.25;

const chakraPresets: ChakraPreset[] = [
    { id: 'schumann', name: 'Schumann Resonance', frequency: 7.83, description: "Earth's natural frequency, for grounding and balance." },
    { id: '40hz', name: '40 Hz Gamma', frequency: 40.0, description: 'Associated with cognitive function, memory, and focus.' },
    { id: 'root', name: 'Root Chakra', frequency: 4.0, description: 'Relates to stability, security, and our basic needs.' },
    { id: 'sacral', name: 'Sacral Chakra', frequency: 5.5, description: 'Connected to creativity, emotions, and pleasure.' },
    { id: 'solar', name: 'Solar Plexus', frequency: 7.0, description: 'Governs self-esteem, willpower, and personal power.' },
    { id: 'heart', name: 'Heart Chakra', frequency: 10.0, description: 'Center of love, compassion, and forgiveness (Alpha waves).' },
    { id: 'throat', name: 'Throat Chakra', frequency: 12.5, description: 'Relates to communication and self-expression.' },
    { id: 'third-eye', name: 'Third Eye', frequency: 15.0, description: 'Center of intuition, foresight, and imagination (Beta).' },
    { id: 'crown', name: 'Crown Chakra', frequency: 20.0, description: 'Connection to the spiritual and the universal (Beta).' },
];

const initialStatus: AppStatus = {
    elapsedTime: 0,
    phase: 'Standby',
    xCarrierFreq: 0,
    yCarrierFreq: 0,
    zBeatFreq: 0,
    physicalZBeat: 0,
};


function App() {
    // --- State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(DEFAULT_DURATION_MIN);
    const [carrierVolume, setCarrierVolume] = useState(0.5);
    const [noiseVolume, setNoiseVolume] = useState(0.1);
    const [torusSpeed, setTorusSpeed] = useState(1.0);
    const [backgroundSpeed, setBackgroundSpeed] = useState(1.0);
    const [selectedPresetId, setSelectedPresetId] = useState('default');
    const [status, setStatus] = useState<AppStatus>(initialStatus);
    const [isAboutModalOpen, setAboutModalOpen] = useState(false);
    const [isSpiralModalOpen, setSpiralModalOpen] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    
    // --- Refs ---
    const soundEngineRef = useRef<SoundEngine | null>(null);

    // --- Memoized Values ---
    const selectedPreset = React.useMemo(() => 
        chakraPresets.find(p => p.id === selectedPresetId),
        [selectedPresetId]
    );

    // --- Effects ---
    // Initialize Sound Engine
    useEffect(() => {
        if (!soundEngineRef.current) {
            soundEngineRef.current = new SoundEngine();
        }
        return () => {
            soundEngineRef.current?.stop();
        };
    }, []);

    // Handle Volume Changes
    useEffect(() => {
        soundEngineRef.current?.setCarrierVolume(carrierVolume);
    }, [carrierVolume]);

    useEffect(() => {
        soundEngineRef.current?.setNoiseVolume(noiseVolume);
    }, [noiseVolume]);
    
    // Handle Diagnostics Toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                setShowDiagnostics(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Core Animation/Update Loop ---
    const animationCallback = useCallback((deltaTime: number) => {
        setStatus(prevStatus => {
            const newElapsedTime = prevStatus.elapsedTime + deltaTime;
            const totalDurationSecs = duration * 60;
            const phaseDuration = totalDurationSecs / 3;

            // Stop if duration is reached
            if (newElapsedTime >= totalDurationSecs) {
                setIsPlaying(false);
                soundEngineRef.current?.stop();
                return initialStatus;
            }

            // Determine current phase and noise type
            let newPhase: AppStatus['phase'] = 'Phase 1 (White)';
            let noiseType: NoiseType = 'white';
            if (newElapsedTime >= phaseDuration * 2) {
                newPhase = 'Phase 3 (Brown)';
                noiseType = 'brown';
            } else if (newElapsedTime >= phaseDuration) {
                newPhase = 'Phase 2 (Pink)';
                noiseType = 'pink';
            }
            soundEngineRef.current?.setNoiseType(noiseType);

            // Calculate frequencies
            const targetZBeat = selectedPreset?.frequency ?? SCHUMANN_RESONANCE;
            const physicalZBeat = targetZBeat + Math.sin(newElapsedTime * 2 * Math.PI * OSCILLATION_HZ) * OSCILLATION_AMPLITUDE;
            const xCarrierFreq = BASE_CARRIER_FREQ + physicalZBeat / 2;
            const yCarrierFreq = BASE_CARRIER_FREQ - physicalZBeat / 2;

            soundEngineRef.current?.setFrequencies(xCarrierFreq, yCarrierFreq);

            return {
                elapsedTime: newElapsedTime,
                phase: newPhase,
                xCarrierFreq,
                yCarrierFreq,
                zBeatFreq: targetZBeat,
                physicalZBeat
            };
        });
    }, [duration, selectedPreset]);

    useAnimationFrame(isPlaying, animationCallback);
    
    // --- Handlers ---
    const handlePlayPause = () => {
        setIsPlaying(prev => {
            const willPlay = !prev;
            if (willPlay) {
                setStatus({ ...initialStatus, phase: 'Phase 1 (White)' });
                soundEngineRef.current?.start();
            } else {
                setStatus(initialStatus);
                soundEngineRef.current?.stop();
            }
            return willPlay;
        });
    };

    const handlePresetChange = (presetId: string) => {
        if (isPlaying) return;
        setSelectedPresetId(presetId);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
            <header className="relative z-20 flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="Logo" className="w-8 h-8 cursor-pointer" onClick={() => setSpiralModalOpen(true)} />
                    <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        Quantum Soundscape
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setAboutModalOpen(true)}
                        className="px-3 py-1.5 text-sm border border-cyan-500/50 rounded-full hover:bg-cyan-500/20 transition-colors"
                    >
                        About The Science
                    </button>
                    <button 
                        onClick={() => setSpiralModalOpen(true)}
                        className="px-3 py-1.5 text-sm border border-cyan-500/50 rounded-full hover:bg-cyan-500/20 transition-colors"
                    >
                        About Spiral Studios
                    </button>
                </div>
            </header>

            <main className="flex-grow relative overflow-y-auto no-scrollbar">
                <div className="fixed inset-0 z-0">
                    <Visualization
                        isPlaying={isPlaying}
                        analyserNode={soundEngineRef.current?.analyserNode ?? null}
                        selectedPreset={selectedPreset}
                        status={status}
                        torusSpeed={torusSpeed}
                        backgroundSpeed={backgroundSpeed}
                    />
                </div>
                
                {/* Scrollable content area */}
                <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col min-h-[120vh]">
                    {/* Spacer pushes the content to the bottom of this tall container */}
                    <div className="flex-grow"></div>
                    
                    {/* Controls are now at the bottom of a TALL, scrollable container */}
                    <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
                        <StatusDisplay status={status} />
                        <ControlPanel
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            duration={duration}
                            onDurationChange={setDuration}
                            carrierVolume={carrierVolume}
                            onCarrierVolumeChange={setCarrierVolume}
                            noiseVolume={noiseVolume}
                            onNoiseVolumeChange={setNoiseVolume}
                            torusSpeed={torusSpeed}
                            onTorusSpeedChange={setTorusSpeed}
                            backgroundSpeed={backgroundSpeed}
                            onBackgroundSpeedChange={setBackgroundSpeed}
                            presets={chakraPresets}
                            selectedPresetId={selectedPresetId}
                            onPresetChange={handlePresetChange}
                            selectedPresetDescription={selectedPreset?.description}
                        />
                    </div>
                </div>
            </main>
            
            <footer className="relative z-20 text-center p-3 text-xs text-gray-500 bg-black/20">
                <p>&copy; {new Date().getFullYear()} Spiral Studios. Press Ctrl+D for diagnostics.</p>
            </footer>

            <AboutModal isOpen={isAboutModalOpen} onClose={() => setAboutModalOpen(false)} />
            <SpiralStudiosModal isOpen={isSpiralModalOpen} onClose={() => setSpiralModalOpen(false)} />
            {showDiagnostics && (
                <DiagnosticHUD 
                    status={status} 
                    noiseVolume={noiseVolume} 
                    oscillationMode={OSCILLATION_MODE}
                    oscillationHz={OSCILLATION_HZ}
                />
            )}
        </div>
    );
}

export default App;