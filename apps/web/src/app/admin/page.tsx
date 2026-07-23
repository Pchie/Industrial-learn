import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAdministrator } from "@/features/auth/server";

export default async function AdminPage() {
  const session = await requireAdministrator("/admin");

  return (
    <ProtectedPage
      description="Administration requires the trusted administrator role and must remain audited."
      session={session}
      title="Administration"
    />
  );
}
