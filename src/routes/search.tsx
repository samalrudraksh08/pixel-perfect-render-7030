import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { SearchWidget } from "@/components/site/search-widget";
import { ResultCard } from "@/components/site/result-card";
import { Filters, type FilterState } from "@/components/site/filters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FLIGHTS, TRAINS, type Trip } from "@/lib/travel-data";
import { useBooking } from "@/lib/booking-store";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search['mode'] === "train" ? ("train" as const) : ("flight" as const),
  }),
  head: () => ({
    meta: [
      { title: "Search results — Wayfare" },
      {
        name: "description",
        content: "Compare flight and train options by price, duration, departure time and stops.",
      },
      { property: "og:title", content: "Search results — Wayfare" },
      {
        property: "og:description",
        content: "Filter and sort flights and trains, then pick the trip that fits.",
      },
    ],
  }),
  component: SearchPage,
});

function hourOf(t: string) {
  return Number(t.slice(0, 2));
}

function windowOf(t: string) {
  const h = hourOf(t);
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function SearchPage() {
  const navigate = useNavigate();
  const { mode } = Route.useSearch();
  const { query, setSelectedTrip, setPassengers, setSeats } = useBooking();
  const [sort, setSort] = useState("price");

  const activeMode = query.mode === mode ? query.mode : mode;
  const all = activeMode === "flight" ? FLIGHTS : TRAINS;

  const priceBounds: [number, number] = [
    Math.min(...all.map((t) => t.price)),
    Math.max(...all.map((t) => t.price)),
  ];
  const durationBounds: [number, number] = [
    Math.min(...all.map((t) => t.durationMin)),
    Math.max(...all.map((t) => t.durationMin)),
  ];
  const operators = [...new Set(all.map((t) => t.operator))];

  const initial: FilterState = {
    maxPrice: priceBounds[1],
    departWindows: [],
    maxDuration: durationBounds[1],
    operators: [],
    stops: [],
  };
  const [filters, setFilters] = useState<FilterState>(initial);
  const [filterKey, setFilterKey] = useState(activeMode);
  if (filterKey !== activeMode) {
    setFilterKey(activeMode);
    setFilters(initial);
  }

  const results = useMemo(() => {
    const list = all.filter((t) => {
      if (t.price > filters.maxPrice) return false;
      if (t.durationMin > filters.maxDuration) return false;
      if (filters.operators.length && !filters.operators.includes(t.operator)) return false;
      if (filters.departWindows.length && !filters.departWindows.includes(windowOf(t.depart)))
        return false;
      if (filters.stops.length) {
        const bucket = t.stops === 0 ? "0" : t.stops === 1 ? "1" : "2";
        if (!filters.stops.includes(bucket)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "duration") return a.durationMin - b.durationMin;
      if (sort === "departure") return hourOf(a.depart) - hourOf(b.depart);
      return a.price - b.price;
    });
  }, [all, filters, sort]);

  function select(trip: Trip) {
    setSelectedTrip(trip);
    setSeats([]);
    setPassengers(
      Array.from({ length: query.passengers }, () => ({ name: "", age: "", gender: "" })),
    );
    navigate({ to: "/booking" });
  }

  const filterPanel = (
    <Filters
      state={filters}
      onChange={setFilters}
      operators={operators}
      priceBounds={priceBounds}
      durationBounds={durationBounds}
      showStops={activeMode === "flight"}
      onReset={() => setFilters(initial)}
    />
  );

  return (
    <div className="bg-secondary/40 pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <SearchWidget compact />

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">{filterPanel}</div>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">
                  {query.from} → {query.to}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {results.length} {activeMode === "flight" ? "flights" : "trains"} ·{" "}
                  {query.passengers} traveller{query.passengers > 1 ? "s" : ""} ·{" "}
                  {query.travelClass}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2 lg:hidden">
                      <SlidersHorizontal className="size-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <div className="mt-8">{filterPanel}</div>
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price (low to high)</SelectItem>
                    <SelectItem value="duration">Duration (shortest)</SelectItem>
                    <SelectItem value="departure">Departure time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((t) => (
                <ResultCard key={t.id} trip={t} onSelect={select} />
              ))}
              {results.length === 0 && (
                <div className="surface-card p-10 text-center">
                  <p className="font-semibold">No trips match these filters</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try widening the price range or clearing operators.
                  </p>
                  <Button className="mt-4" variant="soft" onClick={() => setFilters(initial)}>
                    Reset filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
