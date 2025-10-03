// FIX: This file was a placeholder. Implemented the SoundEngine class.
import type { NoiseType } from '../types.ts';

export class SoundEngine {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private carrierGain: GainNode | null = null;
    
    // Master noise gain, controlled by user slider
    private noiseGain: GainNode | null = null;
    
    // Crossfading noise components
    private noiseGainA: GainNode | null = null;
    private noiseGainB: GainNode | null = null;
    private noiseSourceA: AudioBufferSourceNode | null = null;
    private noiseSourceB: AudioBufferSourceNode | null = null;
    private activeNoiseSlot: 'A' | 'B' = 'A';
    private currentNoiseType: NoiseType | null = null;

    private oscX: OscillatorNode | null = null;
    private oscY: OscillatorNode | null = null;
    private pannerX: StereoPannerNode | null = null;
    private pannerY: StereoPannerNode | null = null;
    
    public analyserNode: AnalyserNode | null = null;
    
    private isInitialized = false;
    private isPlaying = false;
    private isStopping = false;

    private async initialize(): Promise<void> {
        if (this.isInitialized) return;

        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        await this.audioContext.resume();

        // Master and Carrier Gains
        this.masterGain = this.audioContext.createGain();
        this.carrierGain = this.audioContext.createGain();
        
        // Setup noise chain for crossfading
        this.noiseGain = this.audioContext.createGain(); // User-controlled master noise volume
        this.noiseGainA = this.audioContext.createGain();
        this.noiseGainB = this.audioContext.createGain();
        this.noiseGainA.connect(this.noiseGain);
        this.noiseGainB.connect(this.noiseGain);
        
        // Initial state for crossfade gains: A is active, B is silent.
        this.noiseGainA.gain.setValueAtTime(1, this.audioContext.currentTime);
        this.noiseGainB.gain.setValueAtTime(0, this.audioContext.currentTime);

        // Analyser
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;

        // Panners for binaural effect
        this.pannerX = this.audioContext.createStereoPanner();
        this.pannerY = this.audioContext.createStereoPanner();
        this.pannerX.pan.setValueAtTime(-1, this.audioContext.currentTime); // Hard left
        this.pannerY.pan.setValueAtTime(1, this.audioContext.currentTime); // Hard right

        // Connect audio graph
        this.pannerX.connect(this.carrierGain);
        this.pannerY.connect(this.carrierGain);

        this.carrierGain.connect(this.masterGain);
        this.noiseGain.connect(this.masterGain);
        this.masterGain.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
        
        this.masterGain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);

        this.isInitialized = true;
    }

    private createNoiseBuffer(type: NoiseType): AudioBuffer {
        if (!this.audioContext) throw new Error("AudioContext not initialized");
        const bufferSize = 2 * this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain
                b6 = white * 0.115926;
            }
        } else if (type === 'brown') {
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // (roughly) compensate for gain
            }
        }
        return buffer;
    }

    public async start(): Promise<void> {
        if (this.isPlaying) return;
        if (!this.isInitialized) await this.initialize();
        if (!this.audioContext || !this.masterGain) return;
        
        this.isStopping = false; // Reset stopping flag
        await this.audioContext.resume();

        this.oscX = this.audioContext.createOscillator();
        this.oscY = this.audioContext.createOscillator();
        this.oscX.type = 'sine';
        this.oscY.type = 'sine';
        
        this.oscX.connect(this.pannerX!);
        this.oscY.connect(this.pannerY!);

        this.oscX.start();
        this.oscY.start();

        this.masterGain.gain.exponentialRampToValueAtTime(1, this.audioContext.currentTime + 1.0);
        this.isPlaying = true;
    }
    
    public stop(): void {
        if (!this.isPlaying || !this.audioContext || !this.masterGain) return;

        this.isStopping = true;
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 1.0);
        
        setTimeout(() => {
            // If start() was called again, isStopping would be false. This prevents stopping new sounds.
            if (!this.isStopping) return;

            this.oscX?.stop();
            this.oscY?.stop();
            this.noiseSourceA?.stop();
            this.noiseSourceB?.stop();
            
            this.oscX = null;
            this.oscY = null;
            this.noiseSourceA = null;
            this.noiseSourceB = null;
            
            // Reset crossfade gains for next session
            this.noiseGainA?.gain.cancelScheduledValues(this.audioContext!.currentTime);
            this.noiseGainB?.gain.cancelScheduledValues(this.audioContext!.currentTime);
            this.noiseGainA?.gain.setValueAtTime(1.0, this.audioContext!.currentTime);
            this.noiseGainB?.gain.setValueAtTime(0.0, this.audioContext!.currentTime);
            this.activeNoiseSlot = 'A';
            this.currentNoiseType = null;
            
            this.audioContext?.suspend();
            this.isStopping = false;
        }, 1100);

        this.isPlaying = false;
    }

    public getCurrentFrequencies(): { x: number; y: number } {
        if (!this.isPlaying || !this.oscX || !this.oscY) {
            return { x: 0, y: 0 };
        }
        return {
            x: this.oscX.frequency.value,
            y: this.oscY.frequency.value,
        };
    }

    public setFrequencies(x: number, y: number): void {
        if (!this.isPlaying || !this.audioContext || !this.oscX || !this.oscY) return;
        const now = this.audioContext.currentTime;
        this.oscX.frequency.linearRampToValueAtTime(x, now + 0.1);
        this.oscY.frequency.linearRampToValueAtTime(y, now + 0.1);
    }
    
    public setCarrierVolume(volume: number): void {
        if (!this.carrierGain || !this.audioContext) return;
        this.carrierGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    }

    public setNoiseVolume(volume: number): void {
        if (!this.noiseGain || !this.audioContext) return;
        this.noiseGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    }

    public setNoiseType(type: NoiseType): void {
        if (!this.audioContext || !this.noiseGainA || !this.noiseGainB || type === this.currentNoiseType) {
            return;
        }
        this.currentNoiseType = type;

        const FADE_DURATION = 0.5; // 0.5-second crossfade
        const now = this.audioContext.currentTime;
        const isNoiseActive = this.isPlaying || this.isStopping;

        const isAActive = this.activeNoiseSlot === 'A';
        const currentGain = isAActive ? this.noiseGainA : this.noiseGainB;
        const targetGain = isAActive ? this.noiseGainB : this.noiseGainA;
        const oldSource = isAActive ? this.noiseSourceA : this.noiseSourceB;

        // 1. Create and start the new noise source in the target slot
        const newSource = this.audioContext.createBufferSource();
        newSource.buffer = this.createNoiseBuffer(type);
        newSource.loop = true;
        newSource.connect(targetGain);
        if (isNoiseActive) {
            newSource.start();
        }

        if (isAActive) {
            this.noiseSourceB = newSource;
        } else {
            this.noiseSourceA = newSource;
        }

        // 2. Perform the crossfade
        currentGain.gain.linearRampToValueAtTime(0, now + FADE_DURATION);
        targetGain.gain.linearRampToValueAtTime(1, now + FADE_DURATION);

        // 3. Clean up the old source after the fade is complete
        if (oldSource) {
            setTimeout(() => {
                oldSource.stop();
                if (isAActive) {
                    this.noiseSourceA = null;
                } else {
                    this.noiseSourceB = null;
                }
            }, (FADE_DURATION + 0.1) * 1000);
        }

        // 4. Flip the active slot
        this.activeNoiseSlot = isAActive ? 'B' : 'A';
    }
}