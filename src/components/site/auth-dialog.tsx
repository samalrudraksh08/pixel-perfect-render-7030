import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBooking } from "@/lib/booking-store";

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

export function AuthDialog({
  open,
  onOpenChange,
  initialTab = "login",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTab?: "login" | "signup";
}) {
  const { signIn } = useBooking();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    signIn(result.data.email);
    onOpenChange(false);
    toast.success(tab === "login" ? "Welcome back!" : "Account created");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {tab === "login" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            Save travellers, track bookings and unlock member fares.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={submit} className="space-y-4 pt-2" noValidate>
          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {errors['email'] && <p className="text-xs text-destructive">{errors['email']}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {errors['password'] && <p className="text-xs text-destructive">{errors['password']}</p>}
          </div>
          <Button type="submit" variant="cta" className="w-full">
            {tab === "login" ? "Log in" : "Create account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo sign-in only — no real account is created.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
