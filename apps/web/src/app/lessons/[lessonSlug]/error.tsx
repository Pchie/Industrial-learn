"use client";

import { Alert } from "@industrial-learn/design-system";

export default function LessonError() {
  return (
    <Alert title="Lesson unavailable" tone="fault">
      The structured lesson could not be rendered. Try another lesson or return to the
      curriculum browser.
    </Alert>
  );
}
