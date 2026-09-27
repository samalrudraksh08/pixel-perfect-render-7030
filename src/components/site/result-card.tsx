import { ArrowRight, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, inr, type Trip } from "@/lib/travel-data";

export function ResultCard({ trip, onSelect }: { trip: Trip; onSelect: (t: Trip) => void }) {
  return (
    <article className="surface-card flex flex-col gap-5 p-5 transition-shadow hover:shadow-float sm:flex-row sm:items-center">
      <div className="flex min-w-44 items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">
          {trip.logo}
        </span>
        <div>
          <p className="font-semibold leading-tight">{trip.operator}</p>
          <p className="text-xs text-muted-foreground">
            {trip.code} · {trip.travelClass}
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div>
          <p className="font-display text-xl font-semibold">{trip.depart}</p>
          <p className="text-xs text-muted-foreground">{trip.fromCode}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" /> {formatDuration(trip.durationMin)}
          </p>
          <div className="my-1.5 flex items-center gap-1">
            <span className="h-px flex-1 bg-border" />
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="text-xs text-muted-foreground">
            {trip.mode === "flight"
              ? trip.stops === 0
                ? "Non-stop"
                : `${trip.stops} stop${trip.stops > 1 ? "s" : ""}`
              : `${trip.stops} halts`}
          </p>
        </div>
        <div>
          <p className="font-display text-xl font-semibold">{trip.arrive}</p>
          <p className="text-xs text-muted-foreground">{trip.toCode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="text-right">
          <Badge variant="secondary" className="mb-1 gap-1">
            <Star className="size-3 fill-current" /> {trip.rating}
          </Badge>
          <p className="font-display text-xl font-bold">{inr(trip.price)}</p>
          <p className="text-xs text-muted-foreground">per traveller</p>
        </div>
        <Button variant="cta" onClick={() => onSelect(trip)}>
          Select
        </Button>
      </div>
    </article>
  );
}
