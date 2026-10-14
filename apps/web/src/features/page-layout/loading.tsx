import { LoaderCircle } from "lucide-react";

export function PageLoading({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="state-page" aria-live="polite" aria-busy="true">
      <LoaderCircle size={32} aria-hidden="true" />
      <p className="eyebrow">Loading</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="page-loading-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
