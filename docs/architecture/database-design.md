# Industrial Learn Database Design

## Purpose

This document defines the initial PostgreSQL database design for Industrial Learn. It supports students, lecturers, content authors, engineering reviewers, and administrators while keeping student progress and submissions private by default.

This design is implemented through version-controlled SQL files:

- `database/migrations/0001_initial_schema.sql`
- `database/policies/0001_row_level_security.sql`
- `database/seed/0001_roles_permissions.sql`

No administrative database credentials may be exposed to browser code. Browser code may only use public Supabase values; service-role credentials remain server-only.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-ARCH-001: `docs/architecture/system-architecture.md`
- IL-SEC-001: `docs/architecture/security-boundaries.md`

## Design Principles

- PostgreSQL is the system of record for operational data.
- All schema changes use version-controlled migrations.
- Row-level security is enabled for every application table.
- Student data is owned by the student and scoped through `student_profile_id`.
- Lecturer access is granted through authorised cohort relationships.
- Engineering reviewers can review content but do not automatically gain student-data access.
- Content approval is review-gated and source-aware.
- Large binary files are not stored directly in these tables; project submissions reference external file IDs.

## Roles

Supported platform roles:

- Student
- Lecturer
- Content author
- Engineering reviewer
- Administrator

Roles are stored in `roles`, permissions in `permissions`, role mappings in `role_permissions`, and user role assignments in `profile_roles`.

## Shared Timestamp Rule

Every table has:

- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Every table has an `updated_at` trigger using `public.set_updated_at()`.

## Tables

### `profiles`

Primary key: `id uuid`, references `auth.users(id)`.

Required fields: `display_name`, `email`, `created_at`, `updated_at`.

Foreign keys: `id -> auth.users(id)`.

Indexes: `profiles_email_idx`.

Unique constraints: `email`.

Ownership: each profile owns its own profile row. Administrators can manage profiles. Lecturers may read profiles for students in authorised cohorts.

Retention: retain active profiles while account exists; use `deleted_at` for soft deletion before hard deletion policy is finalised.

### `roles`

Primary key: `id uuid`.

Required fields: `role_key`, `name`, `description`, `created_at`, `updated_at`.

Foreign keys: none.

Indexes: unique index from `role_key`.

Unique constraints: `role_key`.

Ownership: system-owned metadata, managed by administrators.

Retention: retain indefinitely for audit consistency.

### `permissions`

Primary key: `id uuid`.

Required fields: `permission_key`, `name`, `description`, `created_at`, `updated_at`.

Foreign keys: none.

Indexes: unique index from `permission_key`.

Unique constraints: `permission_key`.

Ownership: system-owned metadata, managed by administrators.

Retention: retain indefinitely for audit consistency.

### `role_permissions`

Primary key: `id uuid`.

Required fields: `role_id`, `permission_id`, `created_at`, `updated_at`.

Foreign keys: `role_id -> roles(id)`, `permission_id -> permissions(id)`.

Indexes: foreign-key indexes through unique constraint.

Unique constraints: `(role_id, permission_id)`.

Ownership: system-owned metadata, managed by administrators.

Retention: retain while role and permission exist.

### `profile_roles`

Primary key: `id uuid`.

Required fields: `profile_id`, `role_id`, `created_at`, `updated_at`.

Foreign keys: `profile_id -> profiles(id)`, `role_id -> roles(id)`, `assigned_by_profile_id -> profiles(id)`.

Indexes: `profile_roles_profile_id_idx`, `profile_roles_role_id_idx`.

Unique constraints: `(profile_id, role_id)`.

Ownership: administrator-managed assignment metadata.

Retention: retain role history until audit retention policy permits archival.

### `schools`

Primary key: `id uuid`.

Required fields: `slug`, `title`, `description`, `created_at`, `updated_at`.

Foreign keys: `created_by_profile_id`, `updated_by_profile_id`.

Indexes: unique index from `slug`.

Unique constraints: `slug`.

Ownership: platform curriculum metadata, managed by content staff and administrators.

Retention: retain indefinitely; archive rather than delete if referenced by curriculum.

### `disciplines`

Primary key: `id uuid`.

Required fields: `school_id`, `slug`, `title`, `description`, `created_at`, `updated_at`.

Foreign keys: `school_id -> schools(id)`, author/update profile references.

Indexes: school lookup through `(school_id, slug)`.

Unique constraints: `(school_id, slug)`.

Ownership: curriculum metadata, managed by content staff and administrators.

Retention: retain while related programmes exist.

### `programmes`

Primary key: `id uuid`.

Required fields: `discipline_id`, `slug`, `title`, `description`, `publication_status`, `created_at`, `updated_at`.

Foreign keys: `discipline_id -> disciplines(id)`, author/update profile references.

Indexes: `programmes_discipline_id_idx`.

Unique constraints: `(discipline_id, slug)`.

Ownership: curriculum metadata, managed by content staff and administrators.

Retention: retain while cohorts, modules, or learning records reference it.

### `academic_years`

Primary key: `id uuid`.

Required fields: `programme_id`, `year_number`, `title`, `description`, `created_at`, `updated_at`.

Foreign keys: `programme_id -> programmes(id)`, author/update profile references.

Indexes: `academic_years_programme_id_idx`.

Unique constraints: `(programme_id, year_number)`.

Ownership: curriculum metadata, managed by content staff and administrators.

Retention: retain while semesters or student records reference it.

### `semesters`

Primary key: `id uuid`.

Required fields: `academic_year_id`, `semester_number`, `title`, `description`, `created_at`, `updated_at`.

Foreign keys: `academic_year_id -> academic_years(id)`, author/update profile references.

Indexes: `semesters_academic_year_id_idx`.

Unique constraints: `(academic_year_id, semester_number)`.

Ownership: curriculum metadata, managed by content staff and administrators.

Retention: retain while modules or student records reference it.

### `modules`

Primary key: `id uuid`.

Required fields: `semester_id`, `slug`, `title`, `description`, `difficulty`, `academic_level`, `estimated_duration_minutes`, `technical_review_status`, `publication_status`, `version`, `created_at`, `updated_at`.

Foreign keys: `semester_id -> semesters(id)`, author/update profile references.

Indexes: `modules_semester_id_idx`.

Unique constraints: `(semester_id, slug)`.

Ownership: curriculum content metadata, managed by content authors, reviewers, and administrators.

Retention: retain versions while learning records, projects, or review records reference the module.

### `units`

Primary key: `id uuid`.

Required fields: `module_id`, `slug`, `title`, `description`, `display_order`, `created_at`, `updated_at`.

Foreign keys: `module_id -> modules(id)`, author/update profile references.

Indexes: `units_module_id_idx`.

Unique constraints: `(module_id, slug)`.

Ownership: curriculum content metadata, managed by content staff.

Retention: retain while lessons reference the unit.

### `lessons`

Primary key: `id uuid`.

Required fields: `unit_id`, `slug`, `title`, `description`, `difficulty`, `academic_level`, `estimated_duration_minutes`, `technical_review_status`, `publication_status`, `version`, `created_at`, `updated_at`.

Foreign keys: `unit_id -> units(id)`, author/update profile references.

Indexes: `lessons_unit_id_idx`.

Unique constraints: `(unit_id, slug)`.

Ownership: lesson metadata, managed by content authors, reviewers, and administrators.

Retention: retain while progress, assessments, simulations, or content versions reference it.

### `lesson_prerequisites`

Primary key: `id uuid`.

Required fields: `lesson_id`, `prerequisite_lesson_id`, `is_required`, `rationale`, `created_at`, `updated_at`.

Foreign keys: `lesson_id -> lessons(id)`, `prerequisite_lesson_id -> lessons(id)`, author/update profile references.

Indexes: `lesson_prerequisites_lesson_id_idx`, `lesson_prerequisites_prerequisite_lesson_id_idx`.

Unique constraints: `(lesson_id, prerequisite_lesson_id)`.

Ownership: curriculum dependency metadata, managed by content staff.

Retention: retain while related lessons exist.

### `learning_outcomes`

Primary key: `id uuid`.

Required fields: `outcome_text`, `display_order`, `created_at`, `updated_at`, and exactly one of `lesson_id` or `module_id`.

Foreign keys: `lesson_id -> lessons(id)`, `module_id -> modules(id)`, author/update profile references.

Indexes: `learning_outcomes_lesson_id_idx`, `learning_outcomes_module_id_idx`.

Unique constraints: none initially.

Ownership: curriculum outcome metadata, managed by content staff.

Retention: retain with the lesson or module it describes.

### `cohorts`

Primary key: `id uuid`.

Required fields: `programme_id`, `slug`, `title`, `created_at`, `updated_at`.

Foreign keys: `programme_id -> programmes(id)`, author/update profile references.

Indexes: `cohorts_programme_id_idx`.

Unique constraints: `(programme_id, slug)`.

Ownership: administrative course-delivery metadata.

Retention: retain while enrolments, lecturer assignments, or progress summaries reference it.

### `cohort_modules`

Primary key: `id uuid`.

Required fields: `cohort_id`, `module_id`, `created_at`, `updated_at`.

Foreign keys: `cohort_id -> cohorts(id)`, `module_id -> modules(id)`, author/update profile references.

Indexes: `cohort_modules_cohort_id_idx`, `cohort_modules_module_id_idx`.

Unique constraints: `(cohort_id, module_id)`.

Ownership: administrative assignment metadata.

Retention: retain while cohort records are active or needed for audit.

### `cohort_lecturers`

Primary key: `id uuid`.

Required fields: `cohort_id`, `lecturer_profile_id`, `created_at`, `updated_at`.

Foreign keys: `cohort_id -> cohorts(id)`, `lecturer_profile_id -> profiles(id)`, author/update profile references.

Indexes: `cohort_lecturers_lecturer_profile_id_idx`.

Unique constraints: `(cohort_id, lecturer_profile_id)`.

Ownership: administrative lecturer-authorisation metadata.

Retention: retain while cohort access history is needed.

### `enrolments`

Primary key: `id uuid`.

Required fields: `cohort_id`, `student_profile_id`, `enrolled_at`, `created_at`, `updated_at`.

Foreign keys: `cohort_id -> cohorts(id)`, `student_profile_id -> profiles(id)`, author/update profile references.

Indexes: `enrolments_student_profile_id_idx`, `enrolments_cohort_id_idx`.

Unique constraints: `(cohort_id, student_profile_id)`.

Ownership: student membership record, administratively managed.

Retention: retain for academic record period; use `withdrawn_at` for withdrawal state.

### `lesson_progress`

Primary key: `id uuid`.

Required fields: `lesson_id`, `student_profile_id`, `status`, `percent_complete`, `created_at`, `updated_at`.

Foreign keys: `lesson_id -> lessons(id)`, `student_profile_id -> profiles(id)`.

Indexes: `lesson_progress_student_profile_id_idx`, `lesson_progress_lesson_id_idx`.

Unique constraints: `(lesson_id, student_profile_id)`.

Ownership: private student learning data owned by `student_profile_id`.

Retention: retain according to student progress policy; delete or anonymise when account and institutional retention policy allow.

### `assessments`

Primary key: `id uuid`.

Required fields: `slug`, `title`, `description`, `technical_review_status`, `publication_status`, `version`, `created_at`, `updated_at`, and exactly one of `lesson_id` or `module_id`.

Foreign keys: `lesson_id -> lessons(id)`, `module_id -> modules(id)`, author/update profile references.

Indexes: `assessments_lesson_id_idx`, `assessments_module_id_idx`.

Unique constraints: partial unique indexes for `(lesson_id, slug)` and `(module_id, slug)`.

Ownership: assessment content metadata, managed by content staff.

Retention: retain while questions or attempts reference it.

### `questions`

Primary key: `id uuid`.

Required fields: `assessment_id`, `question_type`, `prompt`, `points`, `display_order`, `created_at`, `updated_at`.

Foreign keys: `assessment_id -> assessments(id)`, author/update profile references.

Indexes: `questions_assessment_id_idx`.

Unique constraints: none initially.

Ownership: assessment content, managed by content staff.

Retention: retain with assessment versions and attempts.

### `answer_choices`

Primary key: `id uuid`.

Required fields: `question_id`, `choice_text`, `is_correct`, `display_order`, `created_at`, `updated_at`.

Foreign keys: `question_id -> questions(id)`, author/update profile references.

Indexes: `answer_choices_question_id_idx`.

Unique constraints: none initially.

Ownership: assessment content, managed by content staff.

Retention: retain with questions and attempts.

### `assessment_attempts`

Primary key: `id uuid`.

Required fields: `assessment_id`, `student_profile_id`, `status`, `submitted_answers`, `started_at`, `created_at`, `updated_at`.

Foreign keys: `assessment_id -> assessments(id)`, `student_profile_id -> profiles(id)`.

Indexes: `assessment_attempts_student_profile_id_idx`, `assessment_attempts_assessment_id_idx`.

Unique constraints: none; multiple attempts are allowed.

Ownership: private student assessment data owned by `student_profile_id`.

Retention: retain for academic record period; anonymise or delete according to institutional policy.

### `simulations`

Primary key: `id uuid`.

Required fields: `slug`, `title`, `description`, `state_coverage_required`, `technical_review_status`, `publication_status`, `version`, `created_at`, `updated_at`, and exactly one of `lesson_id` or `module_id`.

Foreign keys: `lesson_id -> lessons(id)`, `module_id -> modules(id)`, author/update profile references.

Indexes: `simulations_lesson_id_idx`, `simulations_module_id_idx`.

Unique constraints: partial unique indexes for `(lesson_id, slug)` and `(module_id, slug)`.

Ownership: simulation content metadata, managed by content staff and reviewers.

Retention: retain while attempts or review records reference it.

### `simulation_attempts`

Primary key: `id uuid`.

Required fields: `simulation_id`, `student_profile_id`, `status`, `scenario_state`, `input_state`, `output_state`, `diagnostic_response`, `started_at`, `created_at`, `updated_at`.

Foreign keys: `simulation_id -> simulations(id)`, `student_profile_id -> profiles(id)`.

Indexes: `simulation_attempts_student_profile_id_idx`, `simulation_attempts_simulation_id_idx`.

Unique constraints: none; multiple attempts are allowed.

Ownership: private student simulation data owned by `student_profile_id`.

Retention: retain for learning analytics period; anonymise diagnostic data when no longer required.

### `projects`

Primary key: `id uuid`.

Required fields: `module_id`, `slug`, `title`, `description`, `rubric`, `technical_review_status`, `publication_status`, `version`, `created_at`, `updated_at`.

Foreign keys: `module_id -> modules(id)`, author/update profile references.

Indexes: `projects_module_id_idx`.

Unique constraints: `(module_id, slug)`.

Ownership: project content metadata, managed by content staff.

Retention: retain while submissions reference it.

### `project_submissions`

Primary key: `id uuid`.

Required fields: `project_id`, `student_profile_id`, `status`, `submission_text`, `attachment_file_ids`, `rubric_result`, `created_at`, `updated_at`.

Foreign keys: `project_id -> projects(id)`, `student_profile_id -> profiles(id)`, `reviewed_by_profile_id -> profiles(id)`.

Indexes: `project_submissions_student_profile_id_idx`, `project_submissions_project_id_idx`.

Unique constraints: none; multiple submissions are allowed unless product policy later restricts attempts.

Ownership: private student submission data owned by `student_profile_id`.

Retention: retain for academic record period; attachments follow file-storage retention policy.

### `source_documents`

Primary key: `id uuid`.

Required fields: `source_id`, `title`, `citation`, `document_type`, `approval_status`, `created_at`, `updated_at`.

Foreign keys: `owner_profile_id`, `created_by_profile_id`, `updated_by_profile_id`.

Indexes: `source_documents_owner_profile_id_idx`.

Unique constraints: `source_id`.

Ownership: source registry metadata, owned by the author or content team.

Retention: retain indefinitely for traceability unless licensing requires removal.

### `knowledge_files`

Primary key: `id uuid`.

Required fields: `knowledge_file_id`, `title`, `description`, `body`, `technical_review_status`, `publication_status`, `version`, `created_at`, `updated_at`.

Foreign keys: `source_document_id -> source_documents(id)`, owner/author/update profile references.

Indexes: `knowledge_files_owner_profile_id_idx`.

Unique constraints: `knowledge_file_id`.

Ownership: knowledge content metadata, owned by content authors and review workflow.

Retention: retain reviewed versions for traceability; archive superseded files instead of deleting.

### `content_versions`

Primary key: `id uuid`.

Required fields: `entity_table`, `entity_id`, `version`, `snapshot`, `change_summary`, `created_at`, `updated_at`.

Foreign keys: author/update profile references.

Indexes: `content_versions_entity_idx`.

Unique constraints: `(entity_table, entity_id, version)`.

Ownership: content version history, managed by authoring workflow.

Retention: retain indefinitely for review and audit traceability.

### `review_records`

Primary key: `id uuid`.

Required fields: `entity_table`, `entity_id`, `reviewer_profile_id`, `decision`, `review_status`, `notes`, `source_check_passed`, `equation_check_passed`, `simulation_check_passed`, `reviewed_at`, `created_at`, `updated_at`.

Foreign keys: `reviewer_profile_id -> profiles(id)`, author/update profile references.

Indexes: `review_records_entity_idx`, `review_records_reviewer_profile_id_idx`.

Unique constraints: none; multiple reviews over time are expected.

Ownership: engineering review record owned by the review workflow and reviewer identity.

Retention: retain indefinitely; review records justify student-use approval.

### `audit_events`

Primary key: `id uuid`.

Required fields: `action`, `severity`, `metadata`, `occurred_at`, `created_at`, `updated_at`.

Foreign keys: `actor_profile_id -> profiles(id)`.

Indexes: `audit_events_actor_profile_id_idx`, `audit_events_entity_idx`.

Unique constraints: none.

Ownership: platform operational audit data, managed by system and administrators.

Retention: retain according to security and institutional audit policy; avoid unnecessary personal data.

### `saved_lessons`

Primary key: `id uuid`.

Required fields: `student_profile_id`, `lesson_id`, `saved_at`, `created_at`, `updated_at`.

Foreign keys: `student_profile_id -> profiles(id)`, `lesson_id -> lessons(id)`.

Indexes: `saved_lessons_student_profile_id_idx`, `saved_lessons_lesson_id_idx`.

Unique constraints: `(student_profile_id, lesson_id)`.

Ownership: private student dashboard preference. Students can read and write only their own saved lessons.

Retention: retain while the student account exists or until the student removes the saved lesson.

### `dashboard_recommendation_dismissals`

Primary key: `id uuid`.

Required fields: `student_profile_id`, `recommendation_id`, `dismissed_at`, `created_at`, `updated_at`.

Foreign keys: `student_profile_id -> profiles(id)`.

Indexes: `dashboard_recommendation_dismissals_student_profile_id_idx`.

Unique constraints: `(student_profile_id, recommendation_id)`.

Ownership: private student dashboard preference. Students can read and write only their own dismissed recommendation records.

Retention: retain while the student account exists or until dashboard preference retention policy is finalised.

## Row-Level Access Policy Summary

### Students

Students can:

- Read and update their own profile.
- Read approved or assigned curriculum content.
- Read and write their own lesson progress.
- Read and write their own assessment attempts.
- Read and write their own simulation attempts.
- Read and write their own project submissions.

Students cannot access another student's private progress, attempts, or submissions.

### Lecturers

Lecturers can:

- Read students associated with authorised cohorts.
- Read enrolments for authorised cohorts.
- Read lesson progress, assessment attempts, simulation attempts, and project submissions for students in authorised cohorts.
- Read assigned and approved curriculum content.

Lecturer access depends on `cohort_lecturers`, `cohort_modules`, and `enrolments`.

### Content Authors

Content authors can:

- Create and update draft content.
- Read review-related content.
- Manage knowledge files and source documents according to authoring policy.

Content authors do not automatically receive student progress or submission access.

### Engineering Reviewers

Engineering reviewers can:

- Read content that is in review workflows.
- Create review records for reviewed content.
- Review source, equation, and simulation metadata.

Engineering reviewers do not automatically receive student progress, assessment-attempt, simulation-attempt, project-submission, enrolment, or cohort access.

### Administrators

Administrators can:

- Manage roles, permissions, cohorts, enrolments, lecturer assignments, and audit data.
- Read student data where administratively required.
- Manage platform metadata and operational policy.

Administrator access must be audited.

## Data Retention Summary

- Profiles: retain while account exists; soft-delete with `deleted_at` until deletion policy is final.
- Student progress and attempts: retain for academic record and learning analytics periods; anonymise or delete when policy allows.
- Project submissions: retain for academic record period; attachments follow file-storage lifecycle policy.
- Content versions and review records: retain indefinitely for traceability.
- Audit events: retain according to security and institutional audit policy.
- Source documents and knowledge files: retain while referenced by approved content or review records.
