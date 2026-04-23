import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserCreateForm } from "@/components/users/user-create-form";
import { UserUpdateForm } from "@/components/users/user-update-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listUsers } from "@/modules/users/service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const users = await listUsers();

  return (
    <div className="space-y-4">
      <UserCreateForm />
      <Card>
        <CardHeader>
          <CardTitle>User and Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--text-muted)]">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Quick Update</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--line)]/50">
                    <td className="p-2 font-medium">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">{user.isActive ? "YES" : "NO"}</td>
                    <td className="p-2">
                      <UserUpdateForm user={{ id: user.id, role: user.role, isActive: user.isActive }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
