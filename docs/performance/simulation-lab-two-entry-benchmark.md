# Simulation Lab Two-Entry Performance Benchmark

Date: 2026-08-27
Build: Next.js 16.2.12 optimized production build
Scope: Hydraulic Cylinder Force plus review-gated Thermal System Boundary

## Bundle Isolation

The catalogue's controlled vocabularies and preview contracts were separated from the full
registry module. This prevents a client-side filter import from pulling simulation-engine
definitions into `/simulations`.

| Identifiable client chunk     |      Raw |     gzip | Evidence                                                   |
| ----------------------------- | -------: | -------: | ---------------------------------------------------------- |
| Simulation Lab client         | 23,412 B |  6,219 B | Contains `Search simulations`                              |
| Attempt-specific client       | 40,518 B | 10,930 B | Contains attempt/runtime interaction strings               |
| Simulation engine definitions | 52,684 B | 14,747 B | Contains engine definitions; absent from catalogue scripts |

The browser lazy-loading test confirms that `/simulations` does not load the attempt runtime,
the assessment answer label, or the engine-definition chunk.

## Deterministic Filter Benchmark

A synthetic registry-like set of 1,000 cards was used to exercise a combined query,
discipline, type, mode, and pathway filter. Nine measured runs executed 500 filter calls
each after 50 warm-up calls.

| Metric                       |    Result |
| ---------------------------- | --------: |
| Registry-like records        |     1,000 |
| Matching records             |       250 |
| Median time per filter call  | 0.5628 ms |
| Slowest sampled run per call | 1.4785 ms |

The command used Node's TypeScript strip mode and the production discovery function. This
is a local CPU microbenchmark, not a browser responsiveness or low-end-device guarantee.

## Current Registry Result

The actual two-entry registry remains immediate under browser interaction. Search terms
such as `boundary`, `closed system`, and `Thermodynamics Foundations` locate the gated
candidate. Structured filters preserve its `Coming later` state and provide no start link.

## Limitations

- Chunk measurements are snapshots of the current optimized build.
- The synthetic records approximate the catalogue card contract; they are not 1,000 real
  simulation definitions.
- Physical low-end-device CPU, constrained-network transfer, and live Supabase latency were
  not measured.
