import { useState, useEffect, useMemo } from 'react';
import { infiniteWell, finiteWell, nodeCount, parity, DEFAULT_HBAR } from './well';

export type WellType = 'infinite' | 'finite';

export interface StateItem {
  n: number;
  title: string;
  description: string;
  E: number;
  isBound: boolean;
  nodes: number;
  parity: 'even' | 'odd' | 'unknown';
}

export interface TransitionItem {
  targetN: number;
  targetTitle: string;
  deltaE: number;
  type: 'absorption' | 'emission';
  deltaN: number;
  matrixElement: number;
  relativeStrength: number; // 0 to 1
}

export interface WavefunctionData {
  x3D: number[];
  psi: number[];
  isBound: boolean;
  zeroCrossingX3D: number[];
  E: number;
}

export interface SavedSlot {
  slotName: 'A' | 'B';
  wellType: WellType;
  L: number;
  m: number;
  V: number;
  n: number;
  E: number;
  nodes: number;
  parity: 'even' | 'odd' | 'unknown';
  isBound: boolean;
  wavefunctionData: WavefunctionData;
  timestamp: number;
}

export interface DiffStats {
  deltaE: number; // Slot B E_n - Slot A E_n (signed)
  deltaLambda: number | null; // 2pi / |deltaE| in simulation units
  deltaNodes: number; // Slot B nodes - Slot A nodes
}

const STATE_DESCRIPTIONS: { [n: number]: { title: string; subtitle: string; ordinal: string } } = {
  1: { title: 'Ground State', subtitle: 'Fundamental (n=1)', ordinal: 'Ground' },
  2: { title: '1st Excited', subtitle: 'Harmonic 1 (n=2)', ordinal: 'First' },
  3: { title: '2nd Excited', subtitle: 'Harmonic 2 (n=3)', ordinal: 'Second' },
  4: { title: '3rd Excited', subtitle: 'Harmonic 3 (n=4)', ordinal: 'Third' },
  5: { title: '4th Excited', subtitle: 'Harmonic 4 (n=5)', ordinal: 'Fourth' },
  6: { title: '5th Excited', subtitle: 'Harmonic 5 (n=6)', ordinal: 'Fifth' },
  7: { title: '6th Excited', subtitle: 'Harmonic 6 (n=7)', ordinal: 'Sixth' },
  8: { title: '7th Excited', subtitle: 'Harmonic 7 (n=8)', ordinal: 'Seventh' },
};

export function useQuantumState() {
  // Direct interactive UI parameters
  const [wellType, setWellType] = useState<WellType>('infinite');
  const [L, setL] = useState<number>(3.0);
  const [m, setM] = useState<number>(1.0);
  const [V, setV] = useState<number>(60.0);
  const [activeN, setActiveN] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Layer 4 Toolbar State Variables
  const [displayMode, setDisplayMode] = useState<'psi' | 'prob'>('psi');
  const [isCompareActive, setIsCompareActive] = useState<boolean>(false);
  const [isCrossSection, setIsCrossSection] = useState<boolean>(false);

  // Layer 6 Comparative Slots A & B
  const [slotA, setSlotA] = useState<SavedSlot | null>(null);
  const [slotB, setSlotB] = useState<SavedSlot | null>(null);

  // Unified reset function: resets all physics parameters and toolbar modes to default
  const resetAll = () => {
    setWellType('infinite');
    setL(3.0);
    setM(1.0);
    setV(60.0);
    setActiveN(1);
    setSearchQuery('');
    setDisplayMode('psi');
    setIsCompareActive(false);
    setIsCrossSection(false);
  };

  // Debounced physics parameters (50ms delay) to maintain 60fps on slider drags
  const [debouncedParams, setDebouncedParams] = useState({
    wellType: 'infinite' as WellType,
    L: 3.0,
    m: 1.0,
    V: 60.0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams({ wellType, L, m, V });
    }, 50);

    return () => clearTimeout(timer);
  }, [wellType, L, m, V]);

  // Compute energy levels and states for n=1..8
  const { states, wavefunctionData } = useMemo(() => {
    const { wellType: dWellType, L: dL, m: dM, V: dV } = debouncedParams;
    const computedStates: StateItem[] = [];

    let activeWf: WavefunctionData;

    if (dWellType === 'infinite') {
      // Analytical infinite well
      for (let n = 1; n <= 8; n++) {
        const { E } = infiniteWell(dL, dM, n, DEFAULT_HBAR);
        const meta = STATE_DESCRIPTIONS[n];
        computedStates.push({
          n,
          title: meta.title,
          description: meta.subtitle,
          E,
          isBound: true,
          nodes: n - 1,
          parity: n % 2 === 1 ? 'even' : 'odd',
        });
      }

      // Sample active state wavefunction
      const { psi, E } = infiniteWell(dL, dM, activeN, DEFAULT_HBAR);
      const sampleCount = 180;
      const x3D: number[] = [];
      const psiArr: number[] = [];
      const halfL = dL / 2;

      for (let i = 0; i < sampleCount; i++) {
        const u = i / (sampleCount - 1);
        const xPhys = u * dL;
        x3D.push(xPhys - halfL);
        psiArr.push(psi(xPhys));
      }

      // Zero-crossings for infinite well: x_k = (k / n) * L for k = 0..n
      const zeroCrossings: number[] = [];
      for (let k = 0; k <= activeN; k++) {
        zeroCrossings.push((k / activeN) * dL - halfL);
      }

      activeWf = {
        x3D,
        psi: psiArr,
        isBound: true,
        zeroCrossingX3D: zeroCrossings,
        E,
      };
    } else {
      // Numerical finite well using finite-difference Hamiltonian (N=300 for snappy 5ms execution)
      const sampleN = 300;
      let activeResult = finiteWell(dL, dM, dV, activeN, { N: sampleN, hbar: DEFAULT_HBAR });

      for (let n = 1; n <= 8; n++) {
        const res = finiteWell(dL, dM, dV, n, { N: sampleN, hbar: DEFAULT_HBAR });
        const meta = STATE_DESCRIPTIONS[n];
        const isBound = res.E < dV;
        const nodes = nodeCount(res.psi);
        const stParity = parity(res.psi);

        computedStates.push({
          n,
          title: meta.title,
          description: meta.subtitle,
          E: res.E,
          isBound,
          nodes,
          parity: stParity,
        });

        if (n === activeN) {
          activeResult = res;
        }
      }

      // Shift x coordinates so the well [0, L] is centered around x = 0
      const halfL = dL / 2;
      const x3D = activeResult.x.map((xVal) => xVal - halfL);
      const isBound = activeResult.E < dV;

      // Detect zero-crossing locations from sampled array
      const zeroCrossings: number[] = [];
      const psiVals = activeResult.psi;
      const maxAmp = Math.max(...psiVals.map(Math.abs));
      const thresh = maxAmp * 0.05;

      for (let i = 0; i < psiVals.length - 1; i++) {
        const y1 = psiVals[i];
        const y2 = psiVals[i + 1];
        if (y1 * y2 <= 0 && (Math.abs(y1) > thresh || Math.abs(y2) > thresh)) {
          const t = Math.abs(y1) / (Math.abs(y1) + Math.abs(y2) + 1e-9);
          const xZero = x3D[i] + t * (x3D[i + 1] - x3D[i]);
          zeroCrossings.push(xZero);
        }
      }

      if (zeroCrossings.length === 0) {
        zeroCrossings.push(-halfL, halfL);
      }

      activeWf = {
        x3D,
        psi: activeResult.psi,
        isBound,
        zeroCrossingX3D: zeroCrossings,
        E: activeResult.E,
      };
    }

    return { states: computedStates, wavefunctionData: activeWf };
  }, [debouncedParams, activeN]);

  // Active state item
  const activeState = useMemo(() => {
    return states.find((s) => s.n === activeN) || states[0];
  }, [states, activeN]);

  // Compute Dipole Selection Rules & Allowed Transitions:
  // Parity condition: In a 1D symmetric well, the dipole operator x has odd parity.
  // Transitions are strictly allowed if and only if Δn = |n_f - n_i| is ODD (1, 3, 5, 7...).
  // Even Δn transitions are parity-forbidden (<f|x|i> = 0).
  const allowedTransitions = useMemo(() => {
    if (!activeState) return [];

    const transitions: TransitionItem[] = [];
    const ni = activeState.n;
    const Ei = activeState.E;

    // Maximum theoretical matrix element factor for normalization
    let maxElement = 0;

    for (const target of states) {
      if (target.n === ni) continue;

      const nf = target.n;
      const deltaN = Math.abs(nf - ni);

      // Dipole selection rule: Δn must be odd!
      if (deltaN % 2 === 1) {
        const deltaE = Math.abs(target.E - Ei);
        const type = target.E > Ei ? ('absorption' as const) : ('emission' as const);

        // Dipole matrix element formula for 1D box: |<f|x|i>| ∝ (ni * nf) / (ni^2 - nf^2)^2
        const denominator = Math.pow(ni * ni - nf * nf, 2);
        const element = denominator > 0 ? (ni * nf) / denominator : 0;
        if (element > maxElement) maxElement = element;

        transitions.push({
          targetN: nf,
          targetTitle: target.title,
          deltaE,
          type,
          deltaN,
          matrixElement: element,
          relativeStrength: 1.0, // calculated below
        });
      }
    }

    // Sort by energy difference (closest first)
    transitions.sort((a, b) => a.deltaE - b.deltaE);

    // Compute relative coupling strength (0 to 1)
    if (maxElement > 0) {
      for (const tr of transitions) {
        tr.relativeStrength = Math.min(1.0, Math.max(0.1, tr.matrixElement / maxElement));
      }
    }

    return transitions;
  }, [states, activeState]);

  // Set of target quantum numbers that are dipole-coupled to active state
  const coupledTargetNs = useMemo(() => {
    return new Set<number>(allowedTransitions.map((t) => t.targetN));
  }, [allowedTransitions]);

  // Share of total energy range: (E_n / max_k(E_k)) * 100
  const energySharePercent = useMemo(() => {
    if (!activeState || states.length === 0) return 0;
    const maxE = Math.max(...states.map((s) => s.E));
    if (maxE <= 0) return 0;
    return (activeState.E / maxE) * 100;
  }, [activeState, states]);

  // One-line auto-description
  const autoDescription = useMemo(() => {
    if (!activeState) return '';
    const nodeStr = activeState.nodes === 1 ? '1 node' : `${activeState.nodes} nodes`;
    const parityStr = `${activeState.parity} parity`;

    if (activeState.n === 1) {
      return `Ground state — 0 nodes, ${parityStr}`;
    }
    const ord = STATE_DESCRIPTIONS[activeState.n]?.ordinal || `${activeState.n}th`;
    return `${ord} excited state — ${nodeStr}, ${parityStr}`;
  }, [activeState]);

  // Filtered states based on search query
  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return states;

    return states.filter((st) => {
      const numMatch = st.n.toString() === q || `n=${st.n}` === q.replace(/\s+/g, '');
      if (numMatch) return true;

      if (st.title.toLowerCase().includes(q)) return true;
      if (st.description.toLowerCase().includes(q)) return true;

      if (q === 'bound' && st.isBound) return true;
      if (q === 'leaking' || q === 'leak') return !st.isBound;

      if (q === st.parity) return true;

      return false;
    });
  }, [states, searchQuery]);

  // Save current full config and derived state to Slot A
  const saveToSlotA = () => {
    setSlotA({
      slotName: 'A',
      wellType,
      L,
      m,
      V,
      n: activeN,
      E: activeState.E,
      nodes: activeState.nodes,
      parity: activeState.parity,
      isBound: activeState.isBound,
      wavefunctionData,
      timestamp: Date.now(),
    });
  };

  // Save current full config and derived state to Slot B
  const saveToSlotB = () => {
    setSlotB({
      slotName: 'B',
      wellType,
      L,
      m,
      V,
      n: activeN,
      E: activeState.E,
      nodes: activeState.nodes,
      parity: activeState.parity,
      isBound: activeState.isBound,
      wavefunctionData,
      timestamp: Date.now(),
    });
  };

  const clearSlots = () => {
    setSlotA(null);
    setSlotB(null);
  };

  // Compute DIFF stats between Slot B and Slot A: (Slot B - Slot A)
  const diffStats: DiffStats | null = useMemo(() => {
    if (!slotA || !slotB) return null;

    const deltaE = slotB.E - slotA.E; // Slot B E_n - Slot A E_n (signed)
    const absDeltaE = Math.abs(deltaE);
    // In simulation units hbar=1, c=1: lambda = 2pi / |deltaE|
    const deltaLambda = absDeltaE > 1e-6 ? (2 * Math.PI) / absDeltaE : null;
    const deltaNodes = slotB.nodes - slotA.nodes;

    return {
      deltaE,
      deltaLambda,
      deltaNodes,
    };
  }, [slotA, slotB]);

  return {
    wellType,
    setWellType,
    L,
    setL,
    m,
    setM,
    V,
    setV,
    activeN,
    setActiveN,
    searchQuery,
    setSearchQuery,
    states,
    filteredStates,
    wavefunctionData,
    activeState,
    allowedTransitions,
    coupledTargetNs,
    energySharePercent,
    autoDescription,
    displayMode,
    setDisplayMode,
    isCompareActive,
    setIsCompareActive,
    isCrossSection,
    setIsCrossSection,
    resetAll,
    slotA,
    slotB,
    saveToSlotA,
    saveToSlotB,
    clearSlots,
    diffStats,
  };
}
