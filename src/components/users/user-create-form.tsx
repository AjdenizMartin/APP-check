"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function UserCreateForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      role: UserRole.EMPLOYEE,
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not create user");
      return;
    }

    reset();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-elevated)] p-4 md:grid-cols-4">
      <Input placeholder="Email" {...register("email")} />
      <Input placeholder="Full name" {...register("name")} />
      <select className="h-10 rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]" {...register("role")}>
        <option value={UserRole.ADMIN}>ADMIN</option>
        <option value={UserRole.SUPERVISOR}>SUPERVISOR</option>
        <option value={UserRole.EMPLOYEE}>EMPLOYEE</option>
      </select>
      <Input type="password" placeholder="Initial password" {...register("password")} />
      <Button type="submit" disabled={isSubmitting} className="md:col-span-4">
        {isSubmitting ? "Creating..." : "Create user"}
      </Button>
      {Object.values(errors).length > 0 ? <p className="text-xs text-[#f0958c] md:col-span-4">Please review form fields</p> : null}
    </form>
  );
}
