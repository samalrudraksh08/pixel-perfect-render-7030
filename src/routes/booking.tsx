import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useBooking, type PassengerDetails } from "@/lib/booking-store";
import { fareBreakdown, formatDuration, inr } from "@/lib/travel-data";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Traveller details — Wayfare" },
      {
        name: "description",
        content: "Add traveller details, pick seats and review your fare before paying.",
      },
      { property: "og:title", content: "Traveller details — Wayfare" },
      {
        property: "og:description",
        content: "Add traveller details, pick seats and review your fare before paying.",
      },
    ],
  }),
  component: BookingPage,
});

const passengerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Enter the full name" })
    .max(60, { message: "Name is too long" }),
  age: z
    .string()
    .trim()
    .refine((v) => Number(v) >= 1 && Number(v) <= 120, { message: "Enter a valid age" }),
  gender: z.string().min(1, { message: "Select gender" }),
});

const contactSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, { message: "Enter a 10-digit phone number" }),
});

const ROWS = ["A", "B", "C", "D", "E", "F"];
const TAKEN = new Set(["1C", "2A", "3D", "4F", "5B", "6E", "2E", "5D"]);

function BookingPage() {
  const navigate = useNavigate();
  const {
    selectedTrip,
    passengers,
    setPassengers,
    contact,
    setContact,
    seats,
    setSeats,
    query,
  } = useBooking();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!selectedTrip) {
    return (
      <EmptyState />
    );
  }

  const fare = fareBreakdown(selectedTrip.price, passengers.length);

  function update(i: number, patch: Partial<PassengerDetails>) {
    setPassengers(passengers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function addPassenger() {
    if (passengers.length >= 9) return;
    setPassengers([...passengers, { name: "", age: "", gender: "" }]);
  }

  function removePassenger(i: number) {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
    setSeats(seats.slice(0, passengers.length - 1));
  }

  function toggleSeat(seat: string) {
    if (TAKEN.has(seat)) return;
    if (seats.includes(seat)) return setSeats(seats.filter((s) => s !== seat));
    if (seats.length >= passengers.length) return;
    setSeats([...seats, seat]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    passengers.forEach((p, i) => {
      const r = passengerSchema.safeParse(p);
      if (!r.success) for (const issue of r.error.issues) next[`p${i}-${issue.path[0]}`] = issue.message;
    });
    const c = contactSchema.safeParse(contact);
    if (!c.success) for (const issue of c.error.issues) next[String(issue.path[0])] = issue.message;
    if (seats.length !== passengers.length) next['seats'] = "Pick one seat per traveller.";
    setErrors(next);
    if (Object.keys(next).length === 0) navigate({ to: "/payment" });
  }

  return (
    <div className="bg-secondary/40 pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold">Review & traveller details</h1>
        <p className="mt-1 text-sm text-muted-foreground">Step 1 of 3 · Details</p>

        <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
          <div className="space-y-6">
            <section className="surface-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-soft font-display font-bold text-primary">
                    {selectedTrip.logo}
                  </span>
                  <div>
                    <p className="font-semibold">{selectedTrip.operator}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTrip.code} · {query.travelClass}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-lg font-semibold">{selectedTrip.depart}</p>
                    <p className="text-xs text-muted-foreground">{selectedTrip.fromCode}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-display text-lg font-semibold">{selectedTrip.arrive}</p>
                    <p className="text-xs text-muted-foreground">{selectedTrip.toCode}</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-4" /> {formatDuration(selectedTrip.durationMin)}
                </p>
              </div>
            </section>

            <section className="surface-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Traveller details</h2>
                <Button type="button" variant="soft" size="sm" onClick={addPassenger}>
                  <Plus className="size-4" /> Add traveller
                </Button>
              </div>

              <div className="space-y-6">
                {passengers.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium">Traveller {i + 1}</p>
                      {passengers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePassenger(i)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor={`name-${i}`}>Full name</Label>
                        <Input
                          id={`name-${i}`}
                          value={p.name}
                          maxLength={60}
                          onChange={(e) => update(i, { name: e.target.value })}
                          placeholder="As on ID"
                        />
                        {errors[`p${i}-name`] && (
                          <p className="text-xs text-destructive">{errors[`p${i}-name`]}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`age-${i}`}>Age</Label>
                        <Input
                          id={`age-${i}`}
                          type="number"
                          min={1}
                          max={120}
                          value={p.age}
                          onChange={(e) => update(i, { age: e.target.value })}
                        />
                        {errors[`p${i}-age`] && (
                          <p className="text-xs text-destructive">{errors[`p${i}-age`]}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <Select value={p.gender} onValueChange={(v) => update(i, { gender: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors[`p${i}-gender`] && (
                          <p className="text-xs text-destructive">{errors[`p${i}-gender`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <h3 className="mb-3 text-sm font-semibold">Contact details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    maxLength={255}
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                  {errors['email'] && <p className="text-xs text-destructive">{errors['email']}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    maxLength={10}
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="10-digit mobile"
                  />
                  {errors['phone'] && <p className="text-xs text-destructive">{errors['phone']}</p>}
                </div>
              </div>
            </section>

            <section className="surface-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Seat selection</h2>
                <p className="text-sm text-muted-foreground">
                  {seats.length}/{passengers.length} selected
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                {Array.from({ length: 8 }, (_, r) => (
                  <div key={r} className="flex items-center gap-2">
                    <span className="w-5 text-xs text-muted-foreground">{r + 1}</span>
                    {ROWS.map((col, ci) => {
                      const seat = `${r + 1}${col}`;
                      const taken = TAKEN.has(seat);
                      const chosen = seats.includes(seat);
                      return (
                        <span key={seat} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => toggleSeat(seat)}
                            disabled={taken}
                            aria-label={`Seat ${seat}`}
                            className={`size-8 rounded-md border text-xs font-medium transition-colors ${
                              taken
                                ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                                : chosen
                                  ? "border-accent bg-accent text-accent-foreground"
                                  : "border-border bg-card hover:border-primary hover:bg-primary-soft"
                            }`}
                          >
                            {col}
                          </button>
                          {ci === 2 && <span className="w-5" />}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
              {errors['seats'] && <p className="mt-3 text-xs text-destructive">{errors['seats']}</p>}
            </section>
          </div>

          <aside className="h-fit lg:sticky lg:top-20">
            <div className="surface-card space-y-3 p-6">
              <h2 className="text-lg font-semibold">Fare summary</h2>
              <Row
                label={`Base fare × ${passengers.length}`}
                value={inr(fare.fare)}
              />
              <Row label="Taxes & surcharges" value={inr(fare.taxes)} />
              <Row label="Convenience fee" value={inr(fare.convenience)} />
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total payable</span>
                <span className="font-display text-xl font-bold">{inr(fare.total)}</span>
              </div>
              <Button type="submit" variant="cta" size="xl" className="mt-2 w-full">
                Continue to Payment
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Free cancellation within 24 hours of booking.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">No trip selected</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Search for a flight or train and pick one to continue.
      </p>
      <Button asChild variant="cta" className="mt-6">
        <Link to="/search" search={{ mode: "flight" } as never}>
          Search trips
        </Link>
      </Button>
    </div>
  );
}
