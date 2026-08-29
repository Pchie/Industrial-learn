export default function SimulationLabLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="simulation-lab-loading-title"
      className="page-shell"
    >
      <p className="eyebrow">Engineering workspace</p>
      <h1 id="simulation-lab-loading-title">Simulation Lab</h1>
      <p role="status">Loading simulation catalogue...</p>
    </section>
  );
}
