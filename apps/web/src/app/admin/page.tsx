import { ProtectedPage } from "@/features/auth/protected-page";
import { requirePlatformManager } from "@/features/auth/server";
import Link from "next/link";

export default async function AdminPage() {
  const session = await requirePlatformManager("/admin");

  return (
    <ProtectedPage
      description="Administration requires trusted platform-management authority and remains audited."
      session={session}
      title="Administration"
    >
      <p>
        <Link href="/admin/users">Manage users and roles</Link>
      </p>
    </ProtectedPage>
  );
}
