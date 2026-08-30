-- Add the Platform Owner role as a distinct application role.
-- PostgreSQL requires a newly added enum value to be committed before it is used,
-- so role metadata and management functions are installed by migration 0015.

alter type public.app_role add value if not exists 'platform_owner' after 'administrator';
