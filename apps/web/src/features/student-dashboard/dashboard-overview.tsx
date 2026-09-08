import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Flame,
  FlaskConical,
  GraduationCap,
  Play,
  SquareFunction,
  Trophy,
  Users,
  Wrench
} from "lucide-react";
import { Alert } from "@industrial-learn/design-system";
import { frontendAssets } from "../app-shell/assets";
import type { DashboardOverviewModel, OverviewCard } from "./overview-model";
import { DemoAction } from "./demo-action";
import styles from "./dashboard.module.css";

function OverviewLink({
  demo,
  href,
  className,
  children
}: {
  demo: boolean;
  href: string;
  className?: string | undefined;
  children: ReactNode;
}) {
  return demo ? (
    <DemoAction className={className}>{children}</DemoAction>
  ) : (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
function ProgressLine({ value, label }: { value: number; label: string }) {
  return (
    <span
      className={styles.progressTrack}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </span>
  );
}
export function DashboardOverview({
  data,
  hideRecommendations = false
}: {
  data: DashboardOverviewModel;
  hideRecommendations?: boolean;
}) {
  const { hero } = data;
  return (
    <>
      <header className={styles.welcome}>
        <h1>
          {data.returning ? "Welcome back, " : "Welcome, "}
          {data.name}! {data.demo && <span aria-hidden="true">👋</span>}
        </h1>
        <p>
          {data.returning
            ? "Let's continue your engineering journey."
            : "Choose a lesson or simulation to begin."}
        </p>
      </header>
      {data.warning && (
        <div className={styles.dataNotice}>
          <Alert title="Some study data is unavailable" tone="warning">
            Available records are shown below. Missing records are not treated as zero
            progress. <Link href="/dashboard">Reload dashboard</Link>
          </Alert>
        </div>
      )}
      <section
        id="continue-learning"
        className={`${styles.section} ${styles.continueSection}`}
        aria-labelledby="continue-learning-title"
      >
        {hero && (
          <figure className={styles.heroArt}>
            <Image
              {...frontendAssets[hero.asset].image}
              alt={frontendAssets[hero.asset].alt}
              sizes="(max-width: 900px) 100vw, 900px"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption className="sr-only">
              Concept illustration, not a construction drawing or saved state.
            </figcaption>
          </figure>
        )}
        <div className={styles.heroContent}>
          <h2 id="continue-learning-title" className={styles.heroEyebrow}>
            Continue learning
          </h2>
          {data.lessonProgressUnavailable && (
            <p className={styles.heroNotice}>
              Your saved lesson location could not be loaded. You can still explore
              available lessons.
            </p>
          )}
          {data.previousUnavailable && (
            <p className={styles.heroNotice}>
              Previous lesson unavailable. An eligible lesson is shown instead.
            </p>
          )}
          {hero ? (
            <>
              <h3>{hero.title}</h3>
              <div className={styles.heroProgress}>
                {hero.progress !== undefined ? (
                  <>
                    <strong>{hero.progress}% Complete</strong>
                    <ProgressLine
                      value={hero.progress}
                      label={`${hero.title} completion`}
                    />
                  </>
                ) : (
                  <span>{hero.status ?? "Available lesson"}</span>
                )}
              </div>
              <p>{hero.description}</p>
              <div className={styles.heroActions}>
                <OverviewLink
                  demo={data.demo}
                  href={hero.href}
                  className={styles.primaryAction}
                >
                  <Play size={15} fill="currentColor" aria-hidden="true" />
                  {hero.action}
                </OverviewLink>
                <OverviewLink
                  demo={data.demo}
                  href="/learn/pilot"
                  className={styles.heroSecondary}
                >
                  {data.demo ? "Review Lesson" : "View learning path"}
                  <ArrowRight size={18} aria-hidden="true" />
                </OverviewLink>
              </div>
              {hero.resumed && (
                <span className={styles.resumeNote}>
                  Returns to the lesson, not an exact saved step or simulation state.
                </span>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <h3>No published lessons are available</h3>
              <p>Approved learning will appear here when it is released.</p>
              <Link href="/learn">Explore the learning catalogue</Link>
            </div>
          )}
        </div>
      </section>
      <section
        id="current-learning"
        className={`${styles.section} ${styles.learningSection}`}
        aria-label="My learning"
      >
        <div className={styles.sectionHeading}>
          <h2>{data.demo ? "Continue Where You Left Off" : "Continue your learning"}</h2>
          <Link href="/learn" className={styles.viewAll}>
            View all
          </Link>
        </div>
        <div className={styles.learningGrid}>
          {data.cards.length ? (
            <ol className={styles.sequence}>
              {data.cards.map((card) => (
                <LearningCard
                  key={`${card.title}-${card.href}`}
                  card={card}
                  demo={data.demo}
                />
              ))}
            </ol>
          ) : (
            <p>No available learning has been assigned yet.</p>
          )}
        </div>
      </section>
      <section className={styles.lowerPanels} aria-label="Next steps">
        <div className={styles.recommendedPanel}>
          <div className={styles.panelHeading}>
            <div>
              <h2>Recommended for You</h2>
              <p>
                {data.demo
                  ? "Based on your progress and interests"
                  : "Based on your available learning"}
              </p>
            </div>
            <Link className={styles.viewAll} href="/learn">
              View all
            </Link>
          </div>
          {hideRecommendations ? (
            <p>Recommendations hidden.</p>
          ) : data.recommendation ? (
            <div className={styles.recommendedContent}>
              <Image
                {...frontendAssets[data.recommendation.asset].image}
                alt=""
                sizes="120px"
                loading="lazy"
              />
              <div>
                <h3>{data.recommendation.title}</h3>
                <p>{data.recommendation.description}</p>
                <div className={styles.recommendationFooter}>
                  <span className={styles.difficulty}>{data.recommendation.kind}</span>
                  <span>
                    <Clock3 size={13} aria-hidden="true" />
                    {data.recommendation.duration}
                  </span>
                  <OverviewLink
                    demo={data.demo}
                    href={data.recommendation.href}
                    className={styles.smallPrimary}
                  >
                    Start learning <ArrowRight size={15} aria-hidden="true" />
                  </OverviewLink>
                </div>
              </div>
            </div>
          ) : (
            <p>Recommendations appear when approved learning is available.</p>
          )}
        </div>
        <nav className={styles.quickActions} aria-label="Learning quick actions">
          <h2>Quick Actions</h2>
          <Link href="/simulations">
            <FlaskConical size={16} aria-hidden="true" />
            <span>Browse Simulations</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
          <Link href="/assessments">
            <ClipboardCheck size={16} aria-hidden="true" />
            <span>Take Assessment</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
          {data.demo ? (
            <>
              <DemoAction>
                <Users size={16} aria-hidden="true" />
                <span>Join Study Group</span>
                <ArrowRight size={13} aria-hidden="true" />
              </DemoAction>
              <DemoAction>
                <Bot size={16} aria-hidden="true" />
                <span>Ask AI Mentor</span>
                <ArrowRight size={13} aria-hidden="true" />
              </DemoAction>
            </>
          ) : (
            <>
              <a href="#results">
                <GraduationCap size={16} aria-hidden="true" />
                <span>Your progress</span>
                <ArrowRight size={13} aria-hidden="true" />
              </a>
              <Link href="/learn/pilot">
                <BookOpen size={16} aria-hidden="true" />
                <span>Study guide</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </>
          )}
        </nav>
      </section>
      <aside className={styles.insights} aria-label="Study snapshot">
        <section
          className={`${styles.statCard} ${styles.metricCard}`}
          aria-label={data.metric.title}
        >
          <h2>
            {data.demo ? (
              <Flame size={18} aria-hidden="true" />
            ) : (
              <Activity size={18} aria-hidden="true" />
            )}
            {data.metric.title}
          </h2>
          <div className={styles.metricBody}>
            <div>
              <div className={styles.statValue}>
                <strong>{data.metric.value}</strong>
                <span>{data.metric.unit}</span>
              </div>
              <p>{data.metric.note}</p>
            </div>
            <div className={styles.miniChart}>
              {data.metric.points.length ? (
                <svg
                  viewBox="0 0 160 68"
                  role="img"
                  aria-label="Fictional seven-day activity example"
                >
                  <path
                    d="M8 59 H154"
                    stroke="var(--il-color-border-subtle)"
                    fill="none"
                  />
                  <polyline
                    points="8,46 38,44 65,34 93,45 121,17 152,16"
                    stroke="#0868f8"
                    fill="none"
                    strokeWidth="1.6"
                  />
                  {[
                    [8, 46],
                    [38, 44],
                    [65, 34],
                    [93, 45],
                    [121, 17],
                    [152, 16]
                  ].map(([cx, cy], i) => (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="3"
                      fill={i === 5 ? "white" : "#0868f8"}
                      stroke="#0868f8"
                    />
                  ))}
                </svg>
              ) : (
                <div className={styles.activityMark}>
                  <CheckCircle2 size={54} strokeWidth={1} aria-hidden="true" />
                  <span>Learning records</span>
                </div>
              )}
              {data.demo && (
                <div className={styles.weekLabels}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                    <span key={index}>{day}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section
          className={`${styles.statCard} ${styles.progressCard}`}
          aria-label={data.progress.title}
        >
          <h2>{data.progress.title}</h2>
          <div className={styles.progressBody}>
            <div
              className={styles.progressRing}
              style={{ "--progress": `${data.progress.percent ?? 0}%` } as CSSProperties}
              role="img"
              aria-label={
                data.progress.percent === null
                  ? "Progress unavailable"
                  : `${data.progress.percent}% of ${data.demo ? "example" : "shown"} lessons completed`
              }
            >
              <span>
                <strong>
                  {data.progress.percent === null ? "--" : `${data.progress.percent}%`}
                </strong>
                <small>
                  {data.progress.percent === null ? "No evidence" : "Complete"}
                </small>
              </span>
            </div>
            <dl className={styles.progressLegend}>
              {[
                ["Completed", data.progress.completed],
                ["In Progress", data.progress.inProgress],
                ["Not Started", data.progress.notStarted]
              ].map(([label, value], index) => (
                <div key={label} data-tone={index}>
                  <dt>
                    <i aria-hidden="true" />
                    {label}
                  </dt>
                  <dd>{data.progress.percent === null ? "--" : value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {!data.demo && (
            <a href="#results" className={styles.scopeNote}>
              Shown lessons only · How progress works
            </a>
          )}
        </section>
        <section
          id="overview-awards"
          className={`${styles.statCard} ${styles.awardCard}`}
          aria-label={data.demo ? "Achievements" : "Competency evidence"}
        >
          <div className={styles.panelHeading}>
            <h2>{data.demo ? "Achievements" : "Competency evidence"}</h2>
            <a
              className={styles.textLink}
              href={data.demo ? "#reference-demo-notice" : "#results"}
            >
              View all
            </a>
          </div>
          <div className={styles.awardRow}>
            {data.awards.map((award, index) => {
              const Icon = [BadgeCheck, Wrench, SquareFunction][index % 3]!;
              return (
                <span
                  key={award.label}
                  className={styles.award}
                  data-tone={index}
                  data-earned={award.awarded}
                  title={`${award.label}: ${award.awarded ? "recorded evidence" : "not yet awarded"}`}
                  role="img"
                  aria-label={`${award.label}: ${award.awarded ? "recorded evidence" : "not yet awarded"}`}
                >
                  <Icon size={29} strokeWidth={1.5} />
                </span>
              );
            })}
          </div>
        </section>
        <section
          className={styles.activitySection}
          aria-labelledby="recent-learning-title"
        >
          <div className={styles.panelHeading}>
            <h2 id="recent-learning-title">
              Recent {data.demo ? "Activity" : "learning activity"}
            </h2>
            <a
              href={data.demo ? "#reference-demo-notice" : "#results"}
              className={styles.textLink}
            >
              View all
            </a>
          </div>
          {data.activity.length ? (
            <ol className={styles.timeline}>
              {data.activity.slice(0, 4).map((item, index) => {
                const Icon = {
                  lesson: CalendarCheck,
                  simulation: FlaskConical,
                  assessment: ClipboardCheck,
                  award: Trophy
                }[item.kind];
                return (
                  <li key={`${item.title}-${index}`} data-kind={item.kind}>
                    <span className={styles.activityIcon}>
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <div>
                      <p>{item.description}</p>
                      <strong>{item.title}</strong>
                    </div>
                    <time>{item.date}</time>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>No recent learning activity has been recorded.</p>
          )}
        </section>
      </aside>
      <section className={styles.futureBanner} aria-labelledby="future-banner-title">
        <Image
          {...frontendAssets.future.image}
          alt={frontendAssets.future.alt}
          sizes="(max-width: 1099px) 100vw, 80vw"
          loading="lazy"
        />
        <div>
          <h2 id="future-banner-title">Future Engineering Awaits</h2>
          <p>Explore smart systems, automation, and sustainable technologies.</p>
          <Link href="/learn/future-engineering">
            Explore Future Engineering
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
function LearningCard({ card, demo }: { card: OverviewCard; demo: boolean }) {
  return (
    <li>
      <div className={styles.lessonThumbnail}>
        <Image
          {...frontendAssets[card.asset].image}
          alt={frontendAssets[card.asset].alt}
          sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 210px"
          loading="lazy"
        />
        <span className={styles.thumbnailLabel} data-kind={card.kind}>
          {card.kind}
        </span>
      </div>
      <div className={styles.lessonBody}>
        <h3>
          <OverviewLink demo={demo} href={card.href}>
            {card.title}
          </OverviewLink>
        </h3>
        <p>{card.detail}</p>
        <div className={styles.cardProgress}>
          {card.progress !== undefined ? (
            <>
              <ProgressLine value={card.progress} label={`${card.title} completion`} />
              <span>
                {card.status === "Completed" && <span>Completed</span>} {card.progress}%
              </span>
            </>
          ) : (
            <small>{card.status ?? "Available"}</small>
          )}
        </div>
      </div>
    </li>
  );
}
