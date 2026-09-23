import { describe, it, expect } from 'vitest';
import {
  infiniteWell,
  finiteWell,
  normalize,
  nodeCount,
  parity,
  HBAR_SI,
} from './well';

describe('infiniteWell: Analytic Energy Ratios & Wavefunction', () => {
  const L = 1.5;
  const m = 0.8;

  // 5 required test cases comparing infiniteWell against known analytic E_n ratios
  it('Test Case 1: E_2 / E_1 ratio equals 4 (2^2 / 1^2)', () => {
    const state1 = infiniteWell(L, m, 1);
    const state2 = infiniteWell(L, m, 2);
    const ratio = state2.E / state1.E;
    expect(ratio).toBeCloseTo(4.0, 8);
  });

  it('Test Case 2: E_3 / E_1 ratio equals 9 (3^2 / 1^2)', () => {
    const state1 = infiniteWell(L, m, 1);
    const state3 = infiniteWell(L, m, 3);
    const ratio = state3.E / state1.E;
    expect(ratio).toBeCloseTo(9.0, 8);
  });

  it('Test Case 3: E_4 / E_1 ratio equals 16 (4^2 / 1^2)', () => {
    const state1 = infiniteWell(L, m, 1);
    const state4 = infiniteWell(L, m, 4);
    const ratio = state4.E / state1.E;
    expect(ratio).toBeCloseTo(16.0, 8);
  });

  it('Test Case 4: E_5 / E_1 ratio equals 25 (5^2 / 1^2)', () => {
    const state1 = infiniteWell(L, m, 1);
    const state5 = infiniteWell(L, m, 5);
    const ratio = state5.E / state1.E;
    expect(ratio).toBeCloseTo(25.0, 8);
  });

  it('Test Case 5: E_3 / E_2 ratio equals 2.25 (9 / 4) and E_4 / E_2 equals 4 (16 / 4)', () => {
    const state2 = infiniteWell(L, m, 2);
    const state3 = infiniteWell(L, m, 3);
    const state4 = infiniteWell(L, m, 4);

    const ratio32 = state3.E / state2.E;
    const ratio42 = state4.E / state2.E;

    expect(ratio32).toBeCloseTo(2.25, 8);
    expect(ratio42).toBeCloseTo(4.0, 8);
  });

  it('satisfies energy ratio invariance regardless of physical parameters or SI hbar', () => {
    const s1 = infiniteWell(0.25, 2.5, 1, HBAR_SI);
    const s2 = infiniteWell(0.25, 2.5, 2, HBAR_SI);
    expect(s2.E / s1.E).toBeCloseTo(4.0, 8);
  });

  it('boundary conditions: psi(0) = 0, psi(L) = 0, and psi is 0 outside [0, L]', () => {
    const { psi } = infiniteWell(1.0, 1.0, 1);
    expect(psi(0)).toBeCloseTo(0, 8);
    expect(psi(1.0)).toBeCloseTo(0, 8);
    expect(psi(-0.2)).toBe(0);
    expect(psi(1.5)).toBe(0);
  });

  it('wavefunction norm ∫ |psi|^2 dx over [0, L] equals 1', () => {
    const L_box = 2.0;
    const { psi } = infiniteWell(L_box, 1.0, 2);
    const N = 1000;
    const dx = L_box / (N - 1);
    const samples: number[] = [];
    for (let i = 0; i < N; i++) {
      samples.push(psi(i * dx));
    }
    // Trapezoidal rule integration
    let integral = 0.5 * (samples[0] ** 2 + samples[N - 1] ** 2);
    for (let i = 1; i < N - 1; i++) {
      integral += samples[i] ** 2;
    }
    integral *= dx;
    expect(integral).toBeCloseTo(1.0, 3);
  });
});

describe('trapezoidal normalize function', () => {
  it('normalizes arbitrary arrays so ∫|psi|^2 dx = 1', () => {
    const N = 200;
    const dx = 0.01;
    const raw = Array.from({ length: N }, (_, i) => Math.sin((i * Math.PI) / N));
    const normalized = normalize(raw, dx);

    let integral = 0.5 * (normalized[0] ** 2 + normalized[N - 1] ** 2);
    for (let i = 1; i < N - 1; i++) {
      integral += normalized[i] ** 2;
    }
    integral *= dx;

    expect(integral).toBeCloseTo(1.0, 6);
  });
});

describe('nodeCount function', () => {
  it('counts 0 sign changes for ground state sinusoidal pulse', () => {
    const samples = Array.from({ length: 100 }, (_, i) => Math.sin(((i + 1) * Math.PI) / 102));
    expect(nodeCount(samples)).toBe(0);
  });

  it('counts n - 1 nodes for infinite well analytical states', () => {
    const L = 1.0;
    for (let n = 1; n <= 4; n++) {
      const { psi } = infiniteWell(L, 1.0, n);
      const samples: number[] = [];
      const N = 300;
      for (let i = 1; i < N - 1; i++) {
        samples.push(psi((i * L) / (N - 1)));
      }
      expect(nodeCount(samples)).toBe(n - 1);
    }
  });
});

describe('parity function', () => {
  it('identifies even and odd functions correctly', () => {
    const even = [0.1, 0.5, 0.9, 1.0, 0.9, 0.5, 0.1];
    const odd = [-0.1, -0.5, -0.9, 0, 0.9, 0.5, 0.1];
    expect(parity(even)).toBe('even');
    expect(parity(odd)).toBe('odd');
  });
});

describe('finiteWell: Finite-Difference Numerical Solution', () => {
  it('computes bound states below barrier V and verifies decay outside [0, L]', () => {
    const L = 1.0;
    const m = 1.0;
    const V = 100;

    const ground = finiteWell(L, m, V, 1);
    expect(ground.E).toBeGreaterThan(0);
    expect(ground.E).toBeLessThan(V);
    expect(ground.isDecayingOutside).toBe(true);
    expect(nodeCount(ground.psi)).toBe(0);
    expect(parity(ground.psi)).toBe('even');

    const state2 = finiteWell(L, m, V, 2);
    expect(state2.E).toBeGreaterThan(ground.E);
    expect(state2.E).toBeLessThan(V);
    expect(state2.isDecayingOutside).toBe(true);
    expect(nodeCount(state2.psi)).toBe(1);
    expect(parity(state2.psi)).toBe('odd');

    const state3 = finiteWell(L, m, V, 3);
    expect(state3.E).toBeGreaterThan(state2.E);
    expect(state3.E).toBeLessThan(V);
    expect(nodeCount(state3.psi)).toBe(2);
    expect(parity(state3.psi)).toBe('even');
  });

  it('finite well energy is lower than infinite well due to barrier penetration', () => {
    const L = 1.0;
    const m = 1.0;
    const V = 120;

    const finiteGround = finiteWell(L, m, V, 1);
    const infiniteGround = infiniteWell(L, m, 1);

    // E_finite < E_infinite because wavefunction penetrates barriers, increasing effective width
    expect(finiteGround.E).toBeLessThan(infiniteGround.E);
  });
});
