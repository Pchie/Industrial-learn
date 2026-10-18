"""Build a new disposable PostgreSQL cluster; never accepts a live database URL.

Requires existing PostgreSQL command-line tools. No Python dependencies. The auth
schema and auth.uid() shim are test-only, not a Supabase Auth or JWT verification.
"""
import datetime
import json
import os
import pathlib
import subprocess
import tempfile

root = pathlib.Path(__file__).resolve().parents[1]
started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
with tempfile.TemporaryDirectory(prefix="industrial-learn-security-", dir="/private/tmp") as directory:
    base = pathlib.Path(directory)
    socket = base / "socket"
    socket.mkdir(mode=0o700)
    data = base / "data"
    env = {k: v for k, v in os.environ.items() if not k.startswith("PG")}
    env.update(PGHOST=str(socket), PGPORT="55455", PGUSER="security_test_owner", PGDATABASE="postgres")

    def run(args):
        result = subprocess.run(args, env=env, text=True, capture_output=True, check=False)
        if result.returncode:
            # Synthetic fixtures only; avoid dumping statements or row contents.
            errors = [line for line in result.stderr.splitlines() if "ERROR:" in line or "FATAL:" in line]
            raise RuntimeError("; ".join(errors) or "Local database command failed")
        return result.stdout

    def sql(text):
        return run(["psql", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", text])

    running = False
    try:
        run(["initdb", "-D", str(data), "-U", "security_test_owner", "--auth-local=trust", "--auth-host=reject", "--no-locale", "-E", "UTF8"])
        run(["pg_ctl", "-D", str(data), "-l", str(base / "postgres.log"), "-o", "-k " + str(socket) + " -p 55455 -c listen_addresses=''", "start"])
        running = True
        sql("""CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
        CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key,email text);
        CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid$$;
        GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon,authenticated,service_role;""")
        applied = []
        for path in sorted((root / "database/migrations").glob("*.sql")):
            run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "--single-transaction", "-f", str(path)])
            applied.append(path.name)
            if path.name.startswith("0004_"):
                for policy in sorted((root / "database/policies").glob("*.sql")):
                    run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-f", str(policy)])
                    applied.append("policy/" + policy.name)
        run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-f", str(root / "database/seed/0001_roles_permissions.sql")])
        args = ["psql", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", "BEGIN"]
        for name in ["account-suspension.rollback.sql", "governed-bookmarks.rollback.sql", "simulation-persistence.rollback.sql", "publication-evidence.rollback.sql"]:
            args += ["-f", str(root / "database/tests" / name)]
        output = run(args + ["-c", "ROLLBACK"])
        arrays = [json.loads(line) for line in output.splitlines() if line.startswith("[{")]
        checks = arrays[-1]
        remaining = sql("select (select count(*) from public.profiles)+(select count(*) from public.saved_lessons)+(select count(*) from public.assessment_attempts)+(select count(*) from public.simulation_attempts);").strip()
        assert remaining == "0", "Synthetic records were not rolled back"
        result = {"status": "PASS", "started_at": started_at, "finished_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "environment": "fresh disposable PostgreSQL with auth.uid shim; not live Supabase", "applied": applied, "checks": checks, "passed": len(checks), "failed": 0, "publication_regression": next((line for line in output.splitlines() if line.startswith("PASS:")), None), "synthetic_rows_remaining": 0}
    finally:
        if running:
            run(["pg_ctl", "-D", str(data), "-m", "fast", "stop"])
    print(json.dumps(result, indent=2))
