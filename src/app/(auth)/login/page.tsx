import { auth } from "@/auth";
import { LoginForm } from "@/components/shared/login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_10%,rgba(181,138,82,0.12),transparent_38%)] p-4">
      <LoginForm />
    </div>
  );
}
