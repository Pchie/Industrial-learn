/** UTC calendar days keep this projection consistent across server and client. */
export function summarizeStudyActivity(timestamps: (string | undefined)[], now: string) {
  const day = 86400000;
  const today = Math.floor(Date.parse(now) / day);
  const days = new Set(
    timestamps
      .filter((value): value is string => Boolean(value))
      .map((value) => Math.floor(Date.parse(value) / day))
      .filter((value) => Number.isFinite(value) && value <= today)
  );
  const points = Array.from({ length: 7 }, (_, index) =>
    days.has(today - 6 + index) ? 1 : 0
  );
  let cursor = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return { streak, points };
}
