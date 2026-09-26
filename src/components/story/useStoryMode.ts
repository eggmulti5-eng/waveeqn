import { useState, useEffect, useRef, useCallback } from 'react';
import type { WellType } from '../../physics/useQuantumState';

// ---------------------------------------------------------------------------
// Beat definitions
// ---------------------------------------------------------------------------
export type BeatId =
  | 'intro'
  | 'orientation'
  | 'interaction'
  | 'feedback'
  | 'escalation'
  | 'challenge'
  | 'report';

export interface DialogueLine {
  text: string;
  shortText: string;
}

export interface Beat {
  id: BeatId;
  lines: DialogueLine[];
  isComplete: (ctx: BeatContext) => boolean;
  noAction?: boolean;
  highlightSelector?: string;
}

export interface BeatContext {
  hasOrbited: boolean;
  initialL: number;
  currentL: number;
  displayMode: 'psi' | 'prob';
  wellType: WellType;
  currentV: number;
  initialV: number;
  challengeTarget: number;
  currentE: number;
  challengeTolerance: number;
  challengeDone: boolean;
  hasInteractedL: boolean;
  hasInteractedV: boolean;
  hasToggledProb: boolean;
}

// ---------------------------------------------------------------------------
// Challenge target generation
// ---------------------------------------------------------------------------
function generateChallengeTarget(): { target: number; hint: string } {
  const n = 2;
  const Ls = [1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.5, 3.8];
  const L = Ls[Math.floor(Math.random() * Ls.length)];
  const E = (n * n * Math.PI * Math.PI) / (2 * L * L);
  return {
    target: parseFloat(E.toFixed(3)),
    hint: `hint: try n=2, L ≈ ${L.toFixed(1)}`,
  };
}

// ---------------------------------------------------------------------------
// Beat content
// ---------------------------------------------------------------------------
function buildBeats(target: number, hint: string, tol: number): Beat[] {
  return [
    {
      id: 'intro',
      noAction: true,
      lines: [
        {
          text: "Greetings, researcher! I'm AXIOM — your quantum guide, lab assistant, and occasional wavefunction whisperer. Welcome to the Observation Chamber! What you're looking at is a potential well: a microscopic trap where energy barriers hold a particle captive.",
          shortText: "I'm AXIOM, your quantum lab assistant. Welcome to the chamber!",
        },
        {
          text: 'In classical physics, a trapped marble can possess any energy it pleases. But here in the quantum world, quantization takes over — only strict, discrete energies are permitted! This chamber renders that invisible math into tangible 3D geometry.',
          shortText: 'Quantization forces discrete energies — made tangible in 3D.',
        },
        {
          text: 'See that luminous ribbon floating in the center? That\'s your wavefunction ψ(x). It encodes every physical secret the universe knows about this particle. Let\'s fire up the bench and explore!',
          shortText: 'The ribbon is ψ(x). Let\'s fire up the bench!',
        },
      ],
      isComplete: () => true,
    },
    {
      id: 'orientation',
      highlightSelector: '[data-tour="toolbar-camera"]',
      lines: [
        {
          text: 'ACTION: Orbit the chamber — click and drag the canvas with your mouse to rotate in 3D space. Give it a spin; I\'ll keep watch right here!',
          shortText: 'ACTION: Orbit the chamber (left-drag canvas).',
        },
        {
          text: 'Look at that arch! This is the fundamental Ground State (n=1) of an infinite square well. Notice how ψ snaps cleanly to zero at both boundary walls? Exactly like a plucked cello string clamped tight at both ends.',
          shortText: 'n=1: Single arch — boundary conditions clamp ψ=0 at walls.',
        },
        {
          text: 'The ribbon\'s height above the zero line equals the amplitude ψ(x). The taller the arch, the higher the amplitude. You can also zoom and reset camera anytime using the bottom toolbar. Pure quantum poetry in 3D!',
          shortText: 'Ribbon height = ψ amplitude. Camera controls in toolbar.',
        },
      ],
      isComplete: (ctx) => ctx.hasOrbited,
    },
    {
      id: 'interaction',
      highlightSelector: '[data-tour="slider-L"]',
      lines: [
        {
          text: 'ACTION: Over in the left panel, grab the Well Width (L) slider and drag it. Watch the ribbon reshape and the energy readout update in real time!',
          shortText: 'ACTION: Drag the Well Width (L) slider.',
        },
        {
          text: 'Notice that? Wider well → lower energy! The governing formula is E_n = n²π²ħ² / (2mL²) — energy drops quadratically as 1/L². Doubling the well halves the spatial confinement and plunges E_1 to a quarter of its original value!',
          shortText: 'E_n ∝ 1/L² — wider well relieves confinement pressure.',
        },
        {
          text: 'This extreme sensitivity to confinement size is why atomic spectra shift so dramatically across the periodic table — even a fractional angstrom change in atomic radius reorganizes the whole spectrum!',
          shortText: 'Confinement scale tunes the entire energy spectrum.',
        },
      ],
      isComplete: (ctx) => ctx.hasInteractedL || Math.abs(ctx.currentL - ctx.initialL) > 0.001,
    },
    {
      id: 'feedback',
      highlightSelector: '[data-tour="toolbar-psi"]',
      lines: [
        {
          text: 'ACTION: Look down at the bottom toolbar and click the |ψ|² button (the right half of the ψ / |ψ|² toggle pill).',
          shortText: 'ACTION: Toggle to |ψ|² in bottom toolbar.',
        },
        {
          text: 'Aha! ψ itself is an abstract complex amplitude that can dip negative — you can\'t build a laboratory detector for negative numbers! But |ψ|² is the Born rule probability density: the physical, measurable chance per unit length of detecting the particle.',
          shortText: '|ψ|² = probability density. ψ can be negative; |ψ|² is strictly ≥ 0.',
        },
        {
          text: 'Notice how any negative lobes in ψ (for n ≥ 2) instantly flip into positive probability peaks in |ψ|²? That sign flip is real physics — quantum interference in superpositions depends entirely on the relative sign of each term!',
          shortText: 'Negative ψ lobes → positive |ψ|² peaks. Sign governs interference.',
        },
      ],
      isComplete: (ctx) => ctx.hasToggledProb || ctx.displayMode === 'prob',
    },
    {
      id: 'escalation',
      lines: [
        {
          text: 'ACTION: In the left panel, toggle the model to FINITE, then drag the Barrier Height (V) slider to lower the wall.',
          shortText: 'ACTION: Switch to FINITE well, lower V.',
        },
        {
          text: 'Now things get wild! With a finite barrier, ψ doesn\'t snap to zero at the walls — it bleeds right through into the classically forbidden zone as an exponential tail. The particle genuinely has a non-zero probability of being detected outside the well!',
          shortText: 'Finite well: ψ decays exponentially outside — classically impossible!',
        },
        {
          text: 'This is quantum tunnelling! At transistor gate scales below 5 nm, tunnelling is the dominant leakage headache chip designers battle every day. Watch those ghostly tails spread as you drop V!',
          shortText: 'Quantum tunnelling drives nm-scale transistor leakage.',
        },
      ],
      isComplete: (ctx) =>
        ctx.hasInteractedV ||
        (ctx.wellType === 'finite' &&
          (ctx.currentV < ctx.initialV ||
            Math.abs(ctx.currentV - ctx.initialV) >= 1 ||
            ctx.currentV < 60)),
    },
    {
      id: 'challenge',
      highlightSelector: '[data-tour="slider-L"]',
      lines: [
        {
          text: `CHALLENGE — Match the Wave! Ready to test your quantum intuition? Switch back to an INFINITE well, select n=2, and tune the L slider until your displayed E_n matches the target energy within ±${tol.toFixed(2)} a.u.\n\nTarget E = ${target.toFixed(3)} a.u. (${hint})`,
          shortText: `CHALLENGE — Match E_n to ${target.toFixed(3)} ±${tol.toFixed(2)} a.u. Use n=2, infinite well, tune L. (${hint})`,
        },
      ],
      isComplete: (ctx) => ctx.challengeDone,
    },
    {
      id: 'report',
      noAction: true,
      lines: [
        {
          text: "Phenomenal work, researcher! You navigated from a humble arching ground state all the way through confinement scaling, Born probability, and quantum tunnelling in record time.",
          shortText: "Phenomenal work! You've mastered confinement, probability, and tunnelling.",
        },
        {
          text: 'Your quantum logbook is compiled below. Review your visited states, or hit the export button to save your custom wavefunction ribbon as a high-resolution PNG for your lab report. When you\'re ready, jump into Sandbox mode for unrestricted experimentation!',
          shortText: 'Export your wavefunction below or enter Sandbox mode!',
        },
      ],
      isComplete: () => true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export interface StoryModeState {
  beatIndex: number;
  lineIndex: number;
  skipTheory: boolean;
  challengeTarget: number;
  challengeHint: string;
  challengeTolerance: number;
  hasOrbited: boolean;
  initialL: number;
  initialV: number;
  visitedNs: Set<number>;
  visitedWellTypes: Set<WellType>;
  beats: Beat[];
}

export interface StoryModeControls {
  state: StoryModeState;
  currentBeat: Beat;
  currentLine: DialogueLine;
  isLastLine: boolean;
  isLastBeat: boolean;
  isBeatActionDone: boolean;
  advance: () => void;
  setSkipTheory: (v: boolean) => void;
  markOrbited: () => void;
  recordVisit: (n: number, wt: WellType) => void;
}

export interface StoryModeInput {
  currentL: number;
  currentV: number;
  currentE: number;
  displayMode: 'psi' | 'prob';
  wellType: WellType;
}

export function useStoryMode(input: StoryModeInput): StoryModeControls {
  const challengeTolerance = 0.12;
  const challengeRef = useRef(generateChallengeTarget());

  // Build beats once (stable reference)
  const beatsRef = useRef<Beat[]>(
    buildBeats(
      challengeRef.current.target,
      challengeRef.current.hint,
      challengeTolerance,
    ),
  );

  const [beatIndex, setBeatIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [skipTheory, setSkipTheory] = useState(false);
  const [hasOrbited, setHasOrbited] = useState(false);
  const [hasInteractedL, setHasInteractedL] = useState(false);
  const [hasInteractedV, setHasInteractedV] = useState(false);
  const [hasToggledProb, setHasToggledProb] = useState(false);

  // Per-beat start values (snapshot taken whenever beatIndex changes)
  const beatStartLRef = useRef(input.currentL);
  const beatStartVRef = useRef(input.currentV);

  // When beatIndex changes, snapshot initial values and reset per-beat interaction flags
  useEffect(() => {
    beatStartLRef.current = input.currentL;
    beatStartVRef.current = input.currentV;
    setHasInteractedL(false);
    setHasInteractedV(false);
    setHasToggledProb(input.displayMode === 'prob');
  }, [beatIndex]);

  // Track live user actions for active beat
  useEffect(() => {
    // Interaction beat: any movement in L
    if (beatIndex === 2) {
      if (Math.abs(input.currentL - beatStartLRef.current) > 0.001) {
        setHasInteractedL(true);
      }
    }
    // Feedback beat: toggle to prob
    if (beatIndex === 3) {
      if (input.displayMode === 'prob') {
        setHasToggledProb(true);
      }
    }
    // Escalation beat: switch to finite and adjust/lower V
    if (beatIndex === 4) {
      if (
        input.wellType === 'finite' &&
        (input.currentV < beatStartVRef.current ||
          Math.abs(input.currentV - beatStartVRef.current) >= 1 ||
          input.currentV < 60)
      ) {
        setHasInteractedV(true);
      }
    }
  }, [beatIndex, input.currentL, input.currentV, input.wellType, input.displayMode]);

  const visitedNsRef = useRef<Set<number>>(new Set([1]));
  const visitedWellTypesRef = useRef<Set<WellType>>(new Set(['infinite']));

  const beats = beatsRef.current;
  const currentBeat = beats[beatIndex];
  const lines = currentBeat?.lines ?? [];
  const currentLine = lines[lineIndex] ?? { text: '', shortText: '' };
  const isLastLine = lineIndex >= lines.length - 1;
  const isLastBeat = beatIndex >= beats.length - 1;

  const challengeDone =
    Math.abs(input.currentE - challengeRef.current.target) <= challengeTolerance &&
    input.wellType === 'infinite';

  const fullCtx: BeatContext = {
    hasOrbited,
    initialL: beatStartLRef.current,
    currentL: input.currentL,
    displayMode: input.displayMode,
    wellType: input.wellType,
    currentV: input.currentV,
    initialV: beatStartVRef.current,
    challengeTarget: challengeRef.current.target,
    currentE: input.currentE,
    challengeTolerance,
    challengeDone,
    hasInteractedL,
    hasInteractedV,
    hasToggledProb,
  };

  const isBeatActionDone = currentBeat?.isComplete(fullCtx) ?? false;

  const advance = useCallback(() => {
    if (!isLastLine) {
      setLineIndex((i) => i + 1);
    } else if (!isLastBeat) {
      setBeatIndex((i) => i + 1);
      setLineIndex(0);
    }
  }, [isLastLine, isLastBeat]);

  const markOrbited = useCallback(() => setHasOrbited(true), []);

  const recordVisit = useCallback((n: number, wt: WellType) => {
    visitedNsRef.current.add(n);
    visitedWellTypesRef.current.add(wt);
  }, []);

  return {
    state: {
      beatIndex,
      lineIndex,
      skipTheory,
      challengeTarget: challengeRef.current.target,
      challengeHint: challengeRef.current.hint,
      challengeTolerance,
      hasOrbited,
      initialL: beatStartLRef.current,
      initialV: beatStartVRef.current,
      visitedNs: visitedNsRef.current,
      visitedWellTypes: visitedWellTypesRef.current,
      beats,
    },
    currentBeat,
    currentLine,
    isLastLine,
    isLastBeat,
    isBeatActionDone,
    advance,
    setSkipTheory,
    markOrbited,
    recordVisit,
  };
}
