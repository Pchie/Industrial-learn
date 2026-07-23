# Content Publication Controls

## Purpose

This document defines security controls for Industrial Learn content governance and publication.

Source IDs: IL-AGENTS-001, IL-SEC-001, IL-AUTH-001, IL-DAL-001.

## Controls

- Students cannot access authoring routes.
- Students cannot access draft governance records.
- Content authors cannot approve their own technical content by default.
- Lecturers do not automatically gain engineering-review authority.
- Review records require named authenticated reviewers.
- Publication requires required evidence for the content type.
- Rollback requires administrator authority.
- Audit events are append-oriented and not editable by normal content authors.
- Published versions remain traceable for historical assessment attempts.

## Publication Gate

Publication is blocked when required source IDs, equation reviews, simulation evidence, safety review, named reviewer, review date, or approved content version is missing.

## Draft Visibility

Unpublished versions are hidden from students. Public/student routes may render only published and approved content records.
