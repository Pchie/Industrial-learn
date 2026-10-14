import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FolderOpen, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { frontendAssets } from "../app-shell/assets";
import styles from "./page-layout.module.css";

export function PageHeading({
  title,
  eyebrow,
  description,
  children,
  id
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <header className={styles.heading}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 id={id}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {children ? <div className={styles.headingActions}>{children}</div> : null}
    </header>
  );
}

// These existing concept images are decorative context, never technical evidence.
export function ImageBand({
  image,
  title,
  description,
  eyebrow,
  children,
  headingLevel = 2,
  priority = false
}: {
  image: keyof typeof frontendAssets;
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
  headingLevel?: 1 | 2;
  priority?: boolean;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className={styles.imageBand} data-artwork={image}>
      <Image
        {...frontendAssets[image].image}
        alt=""
        className={styles.bandImage}
        sizes="(max-width: 1099px) 100vw, calc(100vw - 328px)"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
      <div className={styles.bandCopy}>
        {eyebrow ? <p className={styles.bandEyebrow}>{eyebrow}</p> : null}
        <Heading>{title}</Heading>
        <p>{description}</p>
        {children ? <div className={styles.bandActions}>{children}</div> : null}
      </div>
    </section>
  );
}

export function PageLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className={styles.pageLink} href={href}>
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

const emptyIcons = {
  learning: BookOpen,
  projects: FolderOpen,
  access: ShieldCheck,
  browse: Compass
};

export function WorkspaceEmptyState({
  title,
  children,
  kind = "browse",
  action
}: {
  title: string;
  children: ReactNode;
  kind?: keyof typeof emptyIcons;
  action?: ReactNode;
}) {
  const Icon = emptyIcons[kind];
  return (
    <section className={styles.emptyState}>
      <span className={styles.emptyIcon}>
        <Icon size={28} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <div className={styles.emptyCopy}>{children}</div>
      {action ? <div className={styles.emptyActions}>{action}</div> : null}
    </section>
  );
}
