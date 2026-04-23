"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md border-[var(--line)] bg-[var(--surface-elevated)] shadow-xl shadow-[0_22px_40px_-28px_rgba(0,0,0,0.85)]">
      <CardHeader>
        <CardTitle className="text-xl">App+ Reception Console</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Work Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error ? <p className="text-sm text-[#f0958c]">{state.error}</p> : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
