
# Quantum Bench — Schrödinger's Wave Equation Simulator

An interactive 3D exploratory simulation of the 1D time-independent Schrödinger
equation, built for the "Foundations in Semiconductor Physics – I" problem
statement (ECE / quantum mechanics for engineering students).

Quantum Bench lets students manipulate a particle's mass, a potential well's
width, and (for finite wells) barrier height, and watch the wavefunction
ψ(x), probability density |ψ(x)|², and quantized energy levels respond live
in a real 3D "Observation Chamber" — instead of the static 2D plots most
quantum mechanics courses rely on.


**Repo:** `[(https://github.com/eggmulti5-eng/waveeqn/)]`

---

## Three ways to explore

- **Sandbox** — free-explore mode. Toggle Infinite/Finite potential wells,
  drag Well Width (L), Particle Mass (m), and Barrier Height (V), switch
  between ψ and |ψ|² views, step through quantum numbers n = 1–8, and inspect
  live energy eigenvalues, node counts, parity, and allowed dipole
  transitions for the selected state.
- **Story Mode** — a guided, content-heavy walkthrough narrated by **AXIOM**,
  a pixel-art lab-guide character, that teaches the underlying theory
  (confinement, quantization, probability density, tunneling/leakage) one
  interactive beat at a time, plus an in-app UI tour for anyone new to the
  interface.
- **Challenge Mode** — "Match the Wave": the app generates a random,
  achievable target energy and challenges you to tune L and/or m until your
  computed E_n lands within tolerance. Fully looping ("Next Challenge") with
  a running completed-challenges counter.

Also included: a **Comparative Analysis** mode (save two configurations to
Slot A / Slot B and see a live ghost-overlay + ΔE / Δwavelength / Δnode-count
diff), a **Cross-Section** wireframe view, in-scene **Formula labels**
(the governing Schrödinger equation, E_n, and ψ_n(x) rendered directly in the
3D chamber, click-to-explain), and a downloadable plot of the current
wavefunction for use in a lab report.

---

## Tech stack

- **React + TypeScript + Vite**
- **three.js** via **@react-three/fiber** and **@react-three/drei** (3D
  rendering, camera/orbit controls, in-scene text)
- **@react-three/xr** — WebXR integration (see Known Limitations)
- **ml-matrix** — eigenvalue decomposition for the finite-well
  finite-difference solver
- **Vitest** — physics correctness test suite
- Custom CSS design-token system (monospace, warm technical-lab palette)

## Physics engine

- **Infinite well:** solved analytically —
  `ψ_n(x) = √(2/L) sin(nπx/L)`, `E_n = n²π²ℏ²/2mL²`
- **Finite well:** no closed-form solution exists, so it's solved
  numerically via the finite-difference method — the domain is discretized,
  a tridiagonal Hamiltonian is built (kinetic term + barrier potential), and
  diagonalized to recover eigenstates and eigenvalues, including correct
  exponential decay ("leakage") outside the well boundary.
- All wavefunctions are normalized (trapezoidal-rule integration,
  ∫|ψ|²dx = 1).
- **Independently verified:** a Vitest suite (14/14 passing) checks energy
  ratios against analytic theory (E₂/E₁ = 4, E₃/E₁ = 9, …), normalization,
  finite-well → infinite-well convergence as V grows large, and node
  count/parity for n = 1–5.
- Performance: solver output is memoized by (wellType, L, m, V, n); slider
  drags interpolate visually against the last committed solve and only
  trigger a fresh numerical solve on release, keeping the UI responsive even
  during continuous finite-well dragging.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL Vite prints (defaults to `http://localhost:5173`).

## Running the physics tests

```bash
npm run test
```

---

## Known Limitations

- **WebXR (VR) is scaffolded but not fully functional.** A feature-detected
  "Enter VR" button, `<XR>` provider, and 1:1-scale room positioning
  (`XROrigin`) are implemented per the technical spec, and the chamber
  renders correctly at a walkable scale in a WebXR emulator. However, session
  entry does not reliably start in our testing, so in-headset interaction
  (walking around, inspecting node positions up close) is not confirmed
  working end-to-end. Everything else (Sandbox, Story Mode, Challenge Mode,
  Comparative Analysis) is fully functional on desktop.
- AR entry is not implemented — only VR, since AR adds little value for a
  1D wave-function visualization.
- 3D in-scene formula labels use plain characters rather than fully typeset
  sub/superscripts (2D panel text uses proper math typesetting; the 3D
  labels are a simpler approximation).

## Future Work

- Resolve WebXR session-entry and confirm full walkable node-inspection in
  headset.
- Mirror live E_n/state readouts into the VR session itself (currently only
  static formula labels render in-headset; the DOM overlay panels do not).
- Full math typesetting parity between 2D panels and in-scene 3D labels.
- Optional AR entry point.

