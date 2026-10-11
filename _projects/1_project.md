---
layout: page
title: Benchmarking Shor's algorithm with tensor networks
description: MPS simulations of the full gate-level Shor circuit under coherent errors.
importance: 1
category: research
---

**A. Datta, F. Baccari, I. Siloi and S. Montangero** — *Benchmarking tensor network simulations of Shor's algorithm with coherent error propagation* (in preparation, 2026).

[Slides (AQTIVATE Conference 2026)](https://indico.global/event/16668/contributions/168201/attachments/76891/149310/Shor_Asmita_AQTIVATE.pdf) · [Abstract](https://indico.global/event/16668/contributions/168201/)

---

Shor's algorithm is a natural benchmark for quantum emulators: the circuit is deep and fully compiled, its output can be verified, and it generates nontrivial entanglement. We simulate it on RSA-like semiprimes using the complete gate-level Vedral–Barenco–Ekert (VBE) modular exponentiation circuit, rather than a high-level arithmetic oracle, on a tensor-network quantum emulator based on Matrix Product States (MPS).

The circuits use 7n + 2 qubits and O(n³) gates. Most runs involve around 100k gates, and the largest reaches about 4 million gates (26-bit numbers, 184 qubits). Toffoli gates are applied exactly as single MPOs of bond dimension 2, avoiding decomposition and extra truncation.

**Figures of merit.** We track simulation quality with three complementary measures:

- a fidelity estimate built from the truncated singular values,
- the Jensen–Shannon divergence between the ideal and MPS-sampled output distributions,
- the normalized probability of successfully factoring the number.

**Noiseless circuits.** We study how simulation complexity depends on the bit length and on the multiplicative order *r*. The bond dimension needed for typical circuits grows exponentially with bit length, and the entanglement of the ideal circuit is governed by *r*. This confirms, at the full gate level, behaviour previously reported for oracle-level simulations.

**Coherent errors.** We model noise as systematic unitary over-rotations applied stochastically, with an over-rotation angle and a per-gate probability. These errors generally increase the bond dimension required, largely wash out the dependence on *r*, and reveal thresholds beyond which factoring fails.
