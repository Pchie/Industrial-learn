import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="state-page" aria-labelledby="not-found-title">
      <p className="eyebrow">Page not found</p>
      <h1 id="not-found-title">This part of Industrial Learn is not available yet</h1>
      <p>
        The application foundation is in place, but the requested page has not been
        created.
      </p>
      <Link className="button" href="/">
        Return home
      </Link>
    </section>
  );
}
