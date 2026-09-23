/**
 * Pure Quantum Mechanics Physics Module: Potential Wells
 * Contains NO React or Three.js imports. Fully unit-testable.
 */
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';

/** Standard Planck constant over 2pi in SI units (Joule-seconds) */
export const HBAR_SI = 1.054571817e-34;

/** Default natural/simulation unit for hbar */
export const DEFAULT_HBAR = 1.0;

/**
 * Normalizes a sampled wavefunction array using the trapezoidal integration rule
 * such that ∫ |ψ(x)|² dx = 1.
 *
 * @param psiArray Discrete samples of ψ(x)
 * @param dx Spatial step between samples
 * @returns Normalized copy of psiArray
 */
export function normalize(psiArray: number[], dx: number): number[] {
  const n = psiArray.length;
  if (n < 2 || dx <= 0) {
    return psiArray.slice();
  }

  // Trapezoidal rule: dx * (0.5 * f[0] + sum(f[1..n-2]) + 0.5 * f[n-1])
  let integral = 0.5 * (psiArray[0] * psiArray[0] + psiArray[n - 1] * psiArray[n - 1]);
  for (let i = 1; i < n - 1; i++) {
    integral += psiArray[i] * psiArray[i];
  }
  integral *= dx;

  if (integral <= 0 || !Number.isFinite(integral)) {
    return psiArray.slice();
  }

  const normFactor = Math.sqrt(integral);
  return psiArray.map((v) => v / normFactor);
}

/**
 * Counts the internal nodes (zero-crossings / sign changes) of a wavefunction.
 * Uses a noise threshold relative to the peak amplitude to prevent spurious
 * zero-crossings in asymptotic exponential decay tails.
 *
 * @param psiArray Discrete samples of ψ(x)
 * @param relativeThreshold Fraction of maximum amplitude below which noise is ignored (default 1e-4)
 * @returns Number of detected sign changes
 */
export function nodeCount(psiArray: number[], relativeThreshold = 1e-4): number {
  if (psiArray.length < 2) return 0;

  let maxAmp = 0;
  for (let i = 0; i < psiArray.length; i++) {
    const absVal = Math.abs(psiArray[i]);
    if (absVal > maxAmp) maxAmp = absVal;
  }

  if (maxAmp === 0) return 0;
  const threshold = maxAmp * relativeThreshold;

  let count = 0;
  let lastSign = 0;

  for (let i = 0; i < psiArray.length; i++) {
    const val = psiArray[i];
    if (Math.abs(val) > threshold) {
      const currentSign = val > 0 ? 1 : -1;
      if (lastSign !== 0 && currentSign !== lastSign) {
        count++;
      }
      lastSign = currentSign;
    }
  }

  return count;
}

/**
 * Checks whether the wavefunction is even, odd, or unknown with respect to the center
 * of the sampled grid.
 *
 * For a symmetric potential V(x) centered at the grid midpoint, eigenfunctions
 * have definite parity:
 * - Even: ψ(x) = ψ(-x)  => (E_1, E_3, ...)
 * - Odd:  ψ(x) = -ψ(-x) => (E_2, E_4, ...)
 *
 * @param psiArray Discrete samples of ψ(x)
 * @param tolerance Max relative deviation squared (default 0.05)
 * @returns 'even' | 'odd' | 'unknown'
 */
export function parity(
  psiArray: number[],
  tolerance = 0.05,
): 'even' | 'odd' | 'unknown' {
  const n = psiArray.length;
  if (n < 2) return 'unknown';

  let diffEvenSq = 0;
  let diffOddSq = 0;
  let totalSq = 0;

  for (let i = 0; i < n; i++) {
    const a = psiArray[i];
    const b = psiArray[n - 1 - i];
    const dE = a - b;
    const dO = a + b;
    diffEvenSq += dE * dE;
    diffOddSq += dO * dO;
    totalSq += a * a;
  }

  const denominator = 2 * totalSq;
  if (denominator === 0) return 'unknown';

  const relEven = diffEvenSq / denominator;
  const relOdd = diffOddSq / denominator;

  if (relEven < tolerance && relEven < relOdd) {
    return 'even';
  }
  if (relOdd < tolerance && relOdd < relEven) {
    return 'odd';
  }

  return 'unknown';
}

/**
 * Analytical solution for an infinite square well (particle in a box) of width L
 * with walls at x = 0 and x = L:
 *
 * ψ_n(x) = √(2/L) * sin(n * π * x / L) for 0 ≤ x ≤ L, and 0 outside.
 * E_n = (n² * π² * ħ²) / (2 * m * L²)
 *
 * @param L Well width (> 0)
 * @param m Particle mass (> 0)
 * @param n Principal quantum number (n = 1, 2, 3...)
 * @param hbar Reduced Planck constant (default 1 for simulation/atomic units)
 * @returns Object with wavefunction evaluator psi(x) and energy eigenvalue E
 */
export function infiniteWell(
  L: number,
  m: number,
  n: number,
  hbar: number = DEFAULT_HBAR,
): { psi: (x: number) => number; E: number } {
  if (L <= 0) throw new Error(`Well width L must be positive, got ${L}`);
  if (m <= 0) throw new Error(`Mass m must be positive, got ${m}`);
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error(`Quantum number n must be a positive integer (1, 2, ...), got ${n}`);
  }

  const E = (n * n * Math.PI * Math.PI * hbar * hbar) / (2 * m * L * L);
  const normFactor = Math.sqrt(2 / L);
  const k = (n * Math.PI) / L;

  const psi = (x: number): number => {
    if (x < 0 || x > L) return 0;
    return normFactor * Math.sin(k * x);
  };

  return { psi, E };
}

export interface FiniteWellResult {
  /** Spatial coordinate grid across [-L, 2L] */
  x: number[];
  /** Normalized discrete wavefunction samples */
  psi: number[];
  /** Energy eigenvalue E_n */
  E: number;
  /** Spatial resolution step */
  dx: number;
  /** Whether the wavefunction exponentially decays outside [0, L] */
  isDecayingOutside: boolean;
}

export interface FiniteWellOptions {
  /** Number of grid discretization points (default 500) */
  N?: number;
  /** Reduced Planck constant (default 1) */
  hbar?: number;
}

/**
 * Numerical solution for a 1D finite potential well of width L and barrier height V.
 * Standard convention:
 * - V(x) = 0 inside well [0, L]
 * - V(x) = V outside well (barriers in [-L, 0) and (L, 2L])
 *
 * Discretizes x into N points over [-L, 2L] and constructs the tridiagonal
 * Hamiltonian matrix using a second-derivative central finite-difference stencil:
 *   -ħ²/(2m) d²ψ/dx² + V(x)ψ(x) = Eψ(x)
 *
 * @param L Well width (> 0)
 * @param m Particle mass (> 0)
 * @param V Barrier potential height (V > 0)
 * @param n State index (1 for ground state, 2 for 1st excited state, ...)
 * @param options Optional configuration (N=500, hbar=1)
 * @returns FiniteWellResult
 */
export function finiteWell(
  L: number,
  m: number,
  V: number,
  n: number,
  options: FiniteWellOptions = {},
): FiniteWellResult {
  if (L <= 0) throw new Error(`Well width L must be positive, got ${L}`);
  if (m <= 0) throw new Error(`Mass m must be positive, got ${m}`);
  if (V <= 0) throw new Error(`Potential barrier V must be positive, got ${V}`);
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error(`Quantum number n must be a positive integer, got ${n}`);
  }

  const N = options.N ?? 500;
  const hbar = options.hbar ?? DEFAULT_HBAR;

  // Domain: [-L, 2L]
  const xMin = -L;
  const xMax = 2 * L;
  const dx = (xMax - xMin) / (N - 1);

  // Kinetic term stencil coefficient: ħ² / (2 * m * dx²)
  const k = (hbar * hbar) / (2 * m * dx * dx);

  // Build tridiagonal Hamiltonian matrix
  const H = new Matrix(N, N);
  const x = new Array<number>(N);

  for (let i = 0; i < N; i++) {
    const xi = xMin + i * dx;
    x[i] = xi;

    // Potential: 0 inside [0, L], V outside
    const isInside = xi >= 0 && xi <= L;
    const pot = isInside ? 0 : V;

    H.set(i, i, 2 * k + pot);
    if (i > 0) {
      H.set(i, i - 1, -k);
    }
    if (i < N - 1) {
      H.set(i, i + 1, -k);
    }
  }

  // Diagonalize Hamiltonian
  const ev = new EigenvalueDecomposition(H);
  const eigvals = ev.realEigenvalues;

  // Sort eigenvalue/eigenvector pairs by ascending energy
  const states: { E: number; colIndex: number }[] = [];
  for (let i = 0; i < N; i++) {
    states.push({ E: eigvals[i], colIndex: i });
  }
  states.sort((a, b) => a.E - b.E);

  if (n > states.length) {
    throw new Error(`Requested state n=${n} exceeds matrix rank ${states.length}`);
  }

  const chosenState = states[n - 1];
  const E = chosenState.E;
  const rawPsi = ev.eigenvectorMatrix.getColumn(chosenState.colIndex);

  // Normalize using trapezoidal rule
  let normalizedPsi = normalize(rawPsi, dx);

  // Standard phase convention: ensure first major peak inside well is positive
  let firstPeakVal = 0;
  for (let i = 0; i < N; i++) {
    if (x[i] >= 0 && x[i] <= L) {
      if (Math.abs(normalizedPsi[i]) > Math.abs(firstPeakVal)) {
        firstPeakVal = normalizedPsi[i];
      }
    }
  }
  if (firstPeakVal < 0) {
    normalizedPsi = normalizedPsi.map((v) => -v);
  }

  // Verify decay outside [0, L]:
  // Amplitude at boundary edges x = -L and x = 2L should be significantly decayed
  // compared to maximum amplitude in the well.
  let maxWellAmp = 0;
  for (let i = 0; i < N; i++) {
    if (x[i] >= 0 && x[i] <= L) {
      const amp = Math.abs(normalizedPsi[i]);
      if (amp > maxWellAmp) maxWellAmp = amp;
    }
  }

  const leftEdgeAmp = Math.abs(normalizedPsi[0]);
  const rightEdgeAmp = Math.abs(normalizedPsi[N - 1]);
  const isDecayingOutside =
    maxWellAmp > 0 &&
    leftEdgeAmp < 0.25 * maxWellAmp &&
    rightEdgeAmp < 0.25 * maxWellAmp;

  return {
    x,
    psi: normalizedPsi,
    E,
    dx,
    isDecayingOutside,
  };
}
