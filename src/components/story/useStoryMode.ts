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
          text: "Hello! I'm AXIOM — your quantum lab guide. Welcome to the Observation Chamber. What you're looking at is a potential well: a region where a particle is trapped by energy barriers on both sides.",
          shortText: "I'm AXIOM. Welcome to the Observation Chamber.",
        },
        {
          text: 'Physicists study confined particles because quantization — only discrete energies are allowed — is one of quantum mechanics\' most striking departures from classical physics. This bench makes the invisible math visible as a 3D shape.',
          shortText: 'Quantization makes the invisible math visible in 3D.',
        },
        {
          text: 'The glowing ribbon is your wavefunction ψ(x). It encodes everything the theory knows about the particle\'s state. Let\'s start exploring.',
          shortText: 'The ribbon is ψ(x). Let\'s explore.',
        },
      ],
      isComplete: () => false,
    },
    {
      id: 'orientation',
      lines: [
        {
          text: 'ACTION: Orbit the chamber — left-drag to rotate and get a feel for the 3D geometry. Take a spin; I\'ll wait.',
          shortText: 'ACTION: Orbit the chamber (left-drag).',
        },
        {
          text: 'This is the n=1 Ground State of an infinite square well. ψ is shaped like a single arch because the boundary conditions force ψ=0 at both walls — exactly like a vibrating string fixed at both ends.',
          shortText: 'n=1: single arch — ψ=0 at both walls (boundary conditions).',
        },
        {
          text: 'The ribbon height at any x equals ψ(x). The taller the arch, the higher the probability amplitude at that position.',
          shortText: 'Ribbon height = ψ amplitude.',
        },
      ],
      isComplete: (ctx) => ctx.hasOrbited,
    },
    {
      id: 'interaction',
      lines: [
        {
          text: 'ACTION: Drag the Well Width (L) slider in the left panel. Watch the ribbon reshape and the energy readout update in real time.',
          shortText: 'ACTION: Drag the L slider.',
        },
        {
          text: 'Wider well → lower energy. The formula is E_n = n²π²ħ² / (2mL²) — energy scales as 1/L². Doubling the well halves confinement and drops E_1 to a quarter of its original value.',
          shortText: 'E_n ∝ 1/L² — wider well, lower energy.',
        },
        {
          text: 'This is why atomic energy levels depend so sensitively on atomic radius — a tiny change in confinement shifts the whole spectrum.',
          shortText: 'Confinement size tunes the entire energy spectrum.',
        },
      ],
      isComplete: (ctx) => Math.abs(ctx.currentL - ctx.initialL) > 0.3,
    },
    {
      id: 'feedback',
      lines: [
        {
          text: 'ACTION: Click the |ψ|² button in the bottom toolbar (the right half of the ψ / |ψ|² toggle pair).',
          shortText: 'ACTION: Toggle to |ψ|² in the toolbar.',
        },
        {
          text: 'ψ itself isn\'t directly measurable — it\'s a complex-valued amplitude that can go negative. But |ψ|² is the probability density: the chance per unit length of finding the particle at position x.',
          shortText: '|ψ|² = probability density. ψ can be negative; |ψ|² ≥ 0.',
        },
        {
          text: 'Notice that negative lobes in ψ (for n≥2) become positive peaks in |ψ|². That sign flip is real physics — interference in superpositions depends on the sign of each term.',
          shortText: 'Negative ψ lobes → positive |ψ|² peaks. Sign matters for interference.',
        },
      ],
      isComplete: (ctx) => ctx.displayMode === 'prob',
    },
    {
      id: 'escalation',
      lines: [
        {
          text: 'ACTION: Switch to FINITE well using the toggle in the left panel, then drag the Barrier Height (V) slider to a lower value.',
          shortText: 'ACTION: Switch to FINITE well, lower V.',
        },
        {
          text: 'With a finite barrier, ψ doesn\'t snap to zero at the walls — it decays exponentially into the classically forbidden region. The particle genuinely has a non-zero probability of existing outside the well.',
          shortText: 'Finite well: ψ decays exponentially outside — classically impossible.',
        },
        {
          text: 'This is quantum tunnelling. At transistor scales below ~5 nm, tunnelling is the dominant leakage mechanism engineers design around. Lower V to watch the tails grow and the energy dip below the infinite-well prediction.',
          shortText: 'Tunnelling drives leakage in nm-scale transistors. Lower V to see it.',
        },
      ],
      isComplete: (ctx) =>
        ctx.wellType === 'finite' && ctx.currentV < ctx.initialV - 5,
    },
    {
      id: 'challenge',
      lines: [
        {
          text: `CHALLENGE — Match the Wave! Switch back to INFINITE well and set n=2. Then reshape the well via the L slider until the displayed E_n matches the target within ±${tol.toFixed(2)} a.u.\n\nTarget E = ${target.toFixed(3)} a.u. (${hint})`,
          shortText: `CHALLENGE — Match E_n to ${target.toFixed(3)} ±${tol.toFixed(2)} a.u. Use n=2, infinite well, adjust L. (${hint})`,
        },
      ],
      isComplete: (ctx) => ctx.challengeDone,
    },
    {
      id: 'report',
      noAction: true,
      lines: [
        {
          text: "Excellent work! You've navigated from a simple arching wavefunction all the way to quantum tunnelling — the core of modern quantum mechanics in about ten minutes.",
          shortText: "Great work! You've covered quantum confinement and tunnelling.",
        },
        {
          text: 'Below you\'ll find a summary of what you explored this session, and a button to export the current wavefunction curve as a PNG — useful for your lab report.',
          shortText: 'Export your wavefunction below for your lab report.',
        },
      ],
      isComplete: () => false,
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
  const initialLRef = useRef(input.currentL);
  const initialVRef = useRef(input.currentV);

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
    initialL: initialLRef.current,
    currentL: input.currentL,
    displayMode: input.displayMode,
    wellType: input.wellType,
    currentV: input.currentV,
    initialV: initialVRef.current,
    challengeTarget: challengeRef.current.target,
    currentE: input.currentE,
    challengeTolerance,
    challengeDone,
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
      initialL: initialLRef.current,
      initialV: initialVRef.current,
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
