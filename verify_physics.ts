import { infiniteWell, finiteWell, normalize, nodeCount, parity } from './src/physics/well.ts';

console.log("=== 1. infiniteWell E_n ratios ===");
const L = 1;
const m = 1;
const hbar = 1;

const E1 = infiniteWell(L, m, 1, hbar).E;
const E2 = infiniteWell(L, m, 2, hbar).E;
const E3 = infiniteWell(L, m, 3, hbar).E;
const E4 = infiniteWell(L, m, 4, hbar).E;

console.log(`E1: ${E1}`);
console.log(`E2/E1: ${E2/E1} (expected 4)`);
console.log(`E3/E1: ${E3/E1} (expected 9)`);
console.log(`E4/E1: ${E4/E1} (expected 16)`);


console.log("\n=== 2. normalize() produces ∫|ψ|² dx = 1 ===");
const N_pts = 1000;
const dx_inf = L / (N_pts - 1);
const x_inf = Array.from({length: N_pts}, (_, i) => i * dx_inf);
const psi1_inf = x_inf.map(x => infiniteWell(L, m, 1, hbar).psi(x));
const normalized_inf = normalize(psi1_inf, dx_inf);

function integratePsiSq(psiArray: number[], dx: number): number {
    const n = psiArray.length;
    let integral = 0.5 * (psiArray[0] * psiArray[0] + psiArray[n - 1] * psiArray[n - 1]);
    for (let i = 1; i < n - 1; i++) {
        integral += psiArray[i] * psiArray[i];
    }
    return integral * dx;
}

console.log(`Infinite Well (n=1) Integral: ${integratePsiSq(normalized_inf, dx_inf)}`);

const V_fin = 100;
const fin1 = finiteWell(L, m, V_fin, 1, { N: N_pts, hbar });
console.log(`Finite Well (n=1, V=${V_fin}) Integral: ${integratePsiSq(fin1.psi, fin1.dx)}`);


console.log("\n=== 3. finiteWell's E_n converges toward infiniteWell's E_n ===");
const V_large = 100000;
const fin_large = finiteWell(L, m, V_large, 1, { N: 500, hbar });
const pct_diff = Math.abs(fin_large.E - E1) / E1 * 100;
console.log(`Tested V = ${V_large}`);
console.log(`finiteWell E1: ${fin_large.E}`);
console.log(`infiniteWell E1: ${E1}`);
console.log(`Percent difference: ${pct_diff.toFixed(4)}%`);


console.log("\n=== 4. nodeCount() and parity() return correct values ===");
for (let n = 1; n <= 5; n++) {
    // Testing infiniteWell centered at 0
    const x_sym = Array.from({length: 501}, (_, i) => -L/2 + i * (L/500));
    // infiniteWell domain is [0, L], we can shift it to [-L/2, L/2]
    const psi_n_sym = x_sym.map(x => {
        // infiniteWell gives 0 outside [0,L]. To make it symmetric, evaluate at x + L/2
        return infiniteWell(L, m, n, hbar).psi(x + L/2);
    });
    
    const nodes = nodeCount(psi_n_sym);
    const par = parity(psi_n_sym);
    
    console.log(`n=${n}: nodes=${nodes} (expected ${n-1}), parity=${par} (expected ${n%2!==0 ? 'even' : 'odd'})`);
}
