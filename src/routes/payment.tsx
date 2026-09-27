import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CreditCard, Landmark, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBooking } from "@/lib/booking-store";
import { fareBreakdown, inr } from "@/lib/travel-data";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — Wayfare" },
      {
        name: "description",
        content: "Securely confirm your flight or train booking with card, UPI or net banking.",
      },
      { property: "og:title", content: "Payment — Wayfare" },
      {
        property: "og:description",
        content: "Securely confirm your flight or train booking with card, UPI or net banking.",
      },
    ],
  }),
  component: PaymentPage,
});

const cardSchema = z.object({
  number: z.string().regex(/^[0-9]{16}$/, { message: "Enter a 16-digit card number" }),
  name: z.string().trim().min(2, { message: "Enter the name on card" }).max(60),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, { message: "Use MM/YY" }),
  cvv: z.string().regex(/^[0-9]{3}$/, { message: "3 digits" }),
});

const upiSchema = z.object({
  vpa: z
    .string()
    .trim()
    .regex(/^[\w.-]{2,}@[a-zA-Z]{2,}$/, { message: "Enter a valid UPI ID" }),
});

function PaymentPage() {
  const navigate = useNavigate();
  const { selectedTrip, passengers, confirmBooking } = useBooking();
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [vpa, setVpa] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!selectedTrip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Nothing to pay for yet</h1>
        <Button asChild variant="cta" className="mt-6">
          <Link to="/search" search={{ mode: "flight" } as never}>
            Search trips
          </Link>
        </Button>
      </div>
    );
  }

  const fare = fareBreakdown(selectedTrip.price, passengers.length);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (method === "card") {
      const r = cardSchema.safeParse(card);
      if (!r.success) for (const i of r.error.issues) next[String(i.path[0])] = i.message;
    } else if (method === "upi") {
      const r = upiSchema.safeParse({ vpa });
      if (!r.success) for (const i of r.error.issues) next[String(i.path[0])] = i.message;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    confirmBooking(fare.total);
    navigate({ to: "/confirmation" });
  }

  return (
    <div className="bg-secondary/40 pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold">Payment</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step 2 of 3 · Demo checkout only</p>

        <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
          <section className="surface-card p-6">
            <Tabs value={method} onValueChange={setMethod}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card" className="gap-2">
                  <CreditCard className="size-4" /> Card
                </TabsTrigger>
                <TabsTrigger value="upi" className="gap-2">
                  <Smartphone className="size-4" /> UPI
                </TabsTrigger>
                <TabsTrigger value="netbanking" className="gap-2">
                  <Landmark className="size-4" /> Net banking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input
                    id="card-number"
                    inputMode="numeric"
                    maxLength={16}
                    placeholder="4111 1111 1111 1111"
                    value={card.number}
                    onChange={(e) =>
                      setCard({ ...card, number: e.target.value.replace(/\D/g, "") })
                    }
                  />
                  {errors.number && <p className="text-xs text-destructive">{errors.number}</p>}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="card-name">Name on card</Label>
                  <Input
                    id="card-name"
                    maxLength={60}
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-expiry">Expiry</Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                  {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    type="password"
                    inputMode="numeric"
                    maxLength={3}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                  />
                  {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
                </div>
              </TabsContent>

              <TabsContent value="upi" className="mt-6 space-y-1.5">
                <Label htmlFor="upi">UPI ID</Label>
                <Input
                  id="upi"
                  placeholder="name@bank"
                  maxLength={60}
                  value={vpa}
                  onChange={(e) => setVpa(e.target.value)}
                />
                {errors.vpa && <p className="text-xs text-destructive">{errors.vpa}</p>}
                <p className="pt-2 text-xs text-muted-foreground">
                  You would approve the request in your UPI app.
                </p>
              </TabsContent>

              <TabsContent value="netbanking" className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Choose your bank on the next screen. This demo skips the bank page.
                </p>
              </TabsContent>
            </Tabs>

            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" /> No real payment is processed in this demo.
            </p>
          </section>

          <aside className="h-fit lg:sticky lg:top-20">
            <div className="surface-card space-y-3 p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTrip.operator} {selectedTrip.code}
              </p>
              <p className="text-sm">
                {selectedTrip.from} → {selectedTrip.to} · {selectedTrip.depart}–
                {selectedTrip.arrive}
              </p>
              <Separator />
              <SummaryRow label={`Base fare × ${passengers.length}`} value={inr(fare.fare)} />
              <SummaryRow label="Taxes & surcharges" value={inr(fare.taxes)} />
              <SummaryRow label="Convenience fee" value={inr(fare.convenience)} />
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold">{inr(fare.total)}</span>
              </div>
              <Button type="submit" variant="cta" size="xl" className="mt-2 w-full">
                Confirm Booking
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
