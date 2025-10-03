export interface AppStatus {
  elapsedTime: number;
  phase: 'Standby' | 'Phase 1 (White)' | 'Phase 2 (Pink)' | 'Phase 3 (Brown)' | 'Complete';
  xCarrierFreq: number;
  yCarrierFreq: number;
  zBeatFreq: number; // The final, stable binaural beat
  physicalZBeat?: number; // The "breathing" physical difference for diagnostics
}

export type NoiseType = 'white' | 'pink' | 'brown';

export interface ChakraPreset {
  id: string;
  name: string;
  frequency: number;
  description: string;
}
