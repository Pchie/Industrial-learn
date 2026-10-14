import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="state-page" aria-labelledby="not-found-title">
      <Compass size={36} aria-hidden="true" />
      <p className="eyebrow">Page not found</p>
      <h1 id="not-found-title">This part of Industrial Learn is not available yet</h1>
      <p>
        This page may have moved, may not be published, or may not be available to your
        account. Return to your learning workspace to find an available next step.
      </p>
      <Link className="button" href="/">
        Return home
      </Link>
    </section>
  );
}
