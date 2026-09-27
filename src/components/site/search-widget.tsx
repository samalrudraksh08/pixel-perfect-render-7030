import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, CalendarDays, MapPin, Plane, Search, Train, Users } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CITIES, FLIGHT_CLASSES, TRAIN_CLASSES, type TravelMode } from "@/lib/travel-data";
import { useBooking } from "@/lib/booking-store";

export function SearchWidget({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { query, setQuery } = useBooking();
  const [error, setError] = useState("");

  const isFlight = query.mode === "flight";
  const classes = isFlight ? FLIGHT_CLASSES : TRAIN_CLASSES;

  function setMode(mode: TravelMode) {
    setQuery({
      ...query,
      mode,
      travelClass: mode === "flight" ? "Economy" : "AC",
      roundTrip: mode === "flight" ? query.roundTrip : false,
    });
  }

  function swap() {
    setQuery({ ...query, from: query.to, to: query.from });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.from || !query.to) return setError("Please choose both cities.");
    if (query.from === query.to) return setError("Origin and destination must be different.");
    if (!query.departDate) return setError("Please pick a travel date.");
    if (query.roundTrip && !query.returnDate) return setError("Please pick a return date.");
    setError("");
    navigate({ to: "/search", search: { mode: query.mode } as never });
  }

  return (
    <form
      onSubmit={submit}
      className={`surface-card w-full p-4 sm:p-6 ${compact ? "" : "shadow-float"}`}
      noValidate
    >
      <Tabs value={query.mode} onValueChange={(v) => setMode(v as TravelMode)}>
        <TabsList className="mb-5 h-11 rounded-full bg-secondary p-1">
          <TabsTrigger value="flight" className="gap-2 rounded-full px-6">
            <Plane className="size-4" /> Flights
          </TabsTrigger>
          <TabsTrigger value="train" className="gap-2 rounded-full px-6">
            <Train className="size-4" /> Trains
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isFlight && (
        <div className="mb-4 flex items-center gap-3">
          <Switch
            id="round-trip"
            checked={query.roundTrip}
            onCheckedChange={(v) => setQuery({ ...query, roundTrip: v })}
          />
          <Label htmlFor="round-trip" className="text-sm text-muted-foreground">
            {query.roundTrip ? "Round trip" : "One way"}
          </Label>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From" icon={MapPin}>
              <CitySelect
                value={query.from}
                onChange={(v) => setQuery({ ...query, from: v })}
                id="from-city"
              />
            </Field>
            <Field label="To" icon={MapPin}>
              <CitySelect
                value={query.to}
                onChange={(v) => setQuery({ ...query, to: v })}
                id="to-city"
              />
            </Field>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={swap}
            aria-label="Swap cities"
            className="absolute left-1/2 top-9 hidden size-8 -translate-x-1/2 rounded-full sm:inline-flex"
          >
            <ArrowLeftRight className="size-3.5" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4">
          <Field label={isFlight ? "Departure" : "Date of journey"} icon={CalendarDays}>
            <Input
              type="date"
              value={query.departDate}
              onChange={(e) => setQuery({ ...query, departDate: e.target.value })}
              className="h-11"
            />
          </Field>
          {isFlight && query.roundTrip ? (
            <Field label="Return" icon={CalendarDays}>
              <Input
                type="date"
                value={query.returnDate}
                min={query.departDate || undefined}
                onChange={(e) => setQuery({ ...query, returnDate: e.target.value })}
                className="h-11"
              />
            </Field>
          ) : (
            <Field label="Passengers" icon={Users}>
              <Input
                type="number"
                min={1}
                max={9}
                value={query.passengers}
                onChange={(e) =>
                  setQuery({
                    ...query,
                    passengers: Math.min(9, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
                className="h-11"
              />
            </Field>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4">
          {isFlight && query.roundTrip && (
            <Field label="Passengers" icon={Users}>
              <Input
                type="number"
                min={1}
                max={9}
                value={query.passengers}
                onChange={(e) =>
                  setQuery({
                    ...query,
                    passengers: Math.min(9, Math.max(1, Number(e.target.value) || 1)),
                  })
                }
                className="h-11"
              />
            </Field>
          )}
          <Field label="Class" icon={isFlight ? Plane : Train}>
            <Select
              value={query.travelClass}
              onValueChange={(v) => setQuery({ ...query, travelClass: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" variant="cta" size="xl" className="w-full gap-2">
              <Search className="size-4" /> Search
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      {children}
    </div>
  );
}

function CitySelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-11">
        <SelectValue placeholder="Select city" />
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((c) => (
          <SelectItem key={c.code} value={c.name}>
            {c.name} ({c.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
