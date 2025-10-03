// Minimal microtuning engine for web-style apps (AIStudio compatible)
// Default: A4 = 432 Hz

const SHAPE_SCALES = {
  // 2D polygons (Pythagorean / 3-limit) — cents
  triangle_3:   [0.0, 407.820, 701.955],
  square_4:     [0.0, 203.910, 498.045, 701.955],
  pentagon_5:   [0.0, 203.910, 407.820, 701.955, 905.865],
  hexagon_6:    [0.0, 203.910, 407.820, 701.955, 905.865, 1109.775],
  heptagon_7:   [0.0, 203.910, 407.820, 498.045, 701.955, 905.865, 1109.775],
  octagon_8:    [0.0, 203.910, 407.820, 498.045, 701.955, 905.865, 996.090, 1109.775],
  decagon_10:   [0.0, 203.910, 294.135, 407.820, 498.045, 611.730, 701.955, 905.865, 996.090, 1109.775],
  dodecagon_12: [0.0, 90.225, 203.910, 294.135, 407.820, 498.045, 611.730, 701.955, 792.180, 905.865, 996.090, 1109.775],

  // 3D solids → mapped via SOLID_TO_POLY
  tetrahedron:  null,
  cube:         null,
  octahedron:   null,
  dodecahedron: null,
  icosahedron:  null
};

const SOLID_TO_POLY = {
  tetrahedron: 'square_4',     // 4 verts
  cube: 'octagon_8',           // 8 verts
  octahedron: 'hexagon_6',     // 6 verts
  dodecahedron: 'decagon_10',  // 10 pairs
  icosahedron: 'dodecagon_12'  // 12
};

function resolveShapeKey(key: string) {
  return SOLID_TO_POLY[key as keyof typeof SOLID_TO_POLY] || key;
}

export class TuningEngine {
  private a4: number;
  private rootMIDINote: number;
  private cents: number[] | null;
  private freqTable: Float32Array;
  private lastGood: { cents: number[] | null, a4: number, root: number };

  constructor() {
    this.a4 = 432.0;           // locked default
    this.rootMIDINote = 60;    // C4 default
    this.cents = null;         // active scale (cents) or null for ET
    this.freqTable = new Float32Array(128);
    this.lastGood = { cents: null, a4: 432.0, root: 60 };
    this.setEqualTemperament();
  }

  setA4(hz: number) {
    this.a4 = Number(hz) || 432.0;
    this._rebuild();
  }

  setRoot(midiNote: number) {
    this.rootMIDINote = Math.max(0, Math.min(127, midiNote|0));
    this._rebuild();
  }

  setEqualTemperament() {
    this.cents = null;
    this._rebuild();
  }

  loadShape(shapeKey: string) {
    const key = resolveShapeKey(String(shapeKey));
    const cents = SHAPE_SCALES[key as keyof typeof SHAPE_SCALES];
    if (!cents) throw new Error(`Unknown shape scale: ${shapeKey}`);
    this.cents = cents.slice();
    this._rebuild(true);
  }

  importSCL(sclText: string) {
    // tolerant Scala .scl parser (cents or a/b ratios)
    try {
        const lines = String(sclText).replace(/\r\n/g, '\n').split('\n');
        let i = 0;
        const next = () => (i < lines.length ? lines[i++].trim() : '');
        // Skip leading comments/blank
        while (i < lines.length && (lines[i].trim().startsWith('!') || lines[i].trim()==='')) i++;
        if (i >= lines.length) throw new Error('Invalid .scl: no description');
        next(); // description
        let countLine = '';
        while (countLine === '' || countLine.startsWith('!')) countLine = next();
        const count = parseInt(countLine, 10);
        if (!Number.isFinite(count) || count <= 0 || count > 128) throw new Error('Invalid .scl: bad count');

        const cents = [];
        while (i < lines.length && cents.length < count) {
          const raw = next();
          if (!raw || raw.startsWith('!')) continue;
          if (raw.includes('/')) {
            const [a,b] = raw.split('/').map(Number);
            if (a && b) cents.push(1200 * Math.log2(a/b));
          } else {
            const v = Number(raw);
            if (Number.isFinite(v)) cents.push(v);
          }
        }
        if (cents.length !== count) throw new Error('Invalid .scl: count mismatch');
        this.cents = cents;
        this._rebuild(true);
    } catch (e) {
        console.error("Failed to parse SCL file", e);
        this._revertToLastGood();
    }
  }

  noteToHz(midiNote: number) {
    return this.freqTable[Math.round(midiNote)|0] || 0;
  }

  private _revertToLastGood() {
      this.a4 = this.lastGood.a4;
      this.rootMIDINote = this.lastGood.root;
      this.cents = this.lastGood.cents ? this.lastGood.cents.slice() : null;
      this._rebuild(false);
  }

  private _rebuild(saveGood=false) {
    try {
      if (!this.cents) {
        for (let n=0; n<128; n++) this.freqTable[n] = this.a4 * Math.pow(2, (n - 69) / 12);
      } else {
        const steps = this.cents.length;
        const root = this.rootMIDINote|0;
        const degCents = this.cents.slice().sort((a,b)=>a-b);

        for (let n=0; n<128; n++) {
          const d = n - root;
          const degree = ((d % steps) + steps) % steps;
          const oct = Math.floor(d / steps);
          const centsTotal = degCents[degree] + 1200 * oct;
          const base = this.a4 * Math.pow(2, (n - 69) / 12);
          const expectedET = 100 * d; // ET cents between n and root
          const delta = centsTotal - expectedET;
          this.freqTable[n] = base * Math.pow(2, delta/1200);
        }
      }
      if (saveGood) this.lastGood = { cents: this.cents ? this.cents.slice() : null, a4: this.a4, root: this.rootMIDINote };
    } catch (e) {
      console.warn('Tuning rebuild failed; restored last good state:', e);
      this._revertToLastGood();
    }
  }
}

// example use
/*
import { TuningEngine } from './tuningEngine.js';

const tuning = new TuningEngine();       // A4=432 by default
tuning.loadShape('heptagon_7');          // e.g., Pythagorean diatonic
// tuning.setEqualTemperament();         // if you want plain 12-TET@432
// tuning.importSCL(userUploadedText);   // to load Wilsonic exports
// tuning.setRoot(60);                   // change root (default C4)
// tuning.setA4(432);                    // stays 432 unless you change it

function onNoteOn(midiNote, voice) {
  const hz = tuning.noteToHz(midiNote);
  voice.osc.frequency.setValueAtTime(hz, audioContext.currentTime);
  // ... start envelope, etc.
}
*/
