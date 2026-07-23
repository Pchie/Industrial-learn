import { getServerEnv } from "@industrial-learn/env";
import { PRODUCT_NAME, SCHOOLS } from "@industrial-learn/shared";

export default function HomePage() {
  const env = getServerEnv();

  return (
    <div className="page-stack">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Application foundation</p>
          <h1 id="home-title">{PRODUCT_NAME}</h1>
          <p className="hero-text">
            A temporary shell for a reviewed engineering education platform connecting
            academic theory, structured practice, and professional readiness.
          </p>
        </div>
        <dl className="status-panel" aria-label="Foundation status">
          <div>
            <dt>Framework</dt>
            <dd>Next.js App Router</dd>
          </div>
          <div>
            <dt>Data architecture</dt>
            <dd>PostgreSQL-compatible, Supabase-ready</dd>
          </div>
          <div>
            <dt>Supabase env</dt>
            <dd>{env.supabase.isConfigured ? "Configured" : "Awaiting values"}</dd>
          </div>
        </dl>
      </section>

      <section id="schools" className="section-band" aria-labelledby="schools-title">
        <div className="section-heading">
          <p className="eyebrow">Two connected schools</p>
          <h2 id="schools-title">Core foundations before future systems</h2>
        </div>
        <div className="school-grid">
          {SCHOOLS.map((school) => (
            <article key={school.id} className="school-card">
              <h3>{school.title}</h3>
              <p>{school.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="foundation"
        className="section-band"
        aria-labelledby="foundation-title"
      >
        <div className="section-heading">
          <p className="eyebrow">Prepared boundaries</p>
          <h2 id="foundation-title">Built for the first real product work</h2>
        </div>
        <ul className="capability-list">
          <li>Strict TypeScript and workspace boundaries.</li>
          <li>Environment validation with server and browser safety in mind.</li>
          <li>Responsive, accessible shell with loading, error, and not-found states.</li>
          <li>Unit and end-to-end test configuration ready for CI.</li>
        </ul>
      </section>

      <section id="status" className="section-band" aria-labelledby="status-title">
        <div className="section-heading">
          <p className="eyebrow">Not built yet</p>
          <h2 id="status-title">
            Lessons, simulations, and authentication are intentionally deferred
          </h2>
        </div>
        <p>
          This foundation keeps the application ready for reviewed content, calculation
          libraries, Supabase-backed persistence, and role-based workflows without
          creating those features ahead of the approved scope.
        </p>
      </section>
    </div>
  );
}
