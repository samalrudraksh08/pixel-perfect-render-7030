import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/travel-data";

export type FilterState = {
  maxPrice: number;
  departWindows: string[];
  maxDuration: number;
  operators: string[];
  stops: string[];
};

export const DEPART_WINDOWS = [
  { id: "morning", label: "Morning (05–12)" },
  { id: "afternoon", label: "Afternoon (12–17)" },
  { id: "evening", label: "Evening (17–21)" },
  { id: "night", label: "Night (21–05)" },
];

export function Filters({
  state,
  onChange,
  operators,
  priceBounds,
  durationBounds,
  showStops,
  onReset,
}: {
  state: FilterState;
  onChange: (s: FilterState) => void;
  operators: string[];
  priceBounds: [number, number];
  durationBounds: [number, number];
  showStops: boolean;
  onReset: () => void;
}) {
  function toggle(key: "departWindows" | "operators" | "stops", value: string) {
    const list = state[key];
    onChange({
      ...state,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  }

  return (
    <aside className="surface-card sticky top-20 space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Filters</h3>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={onReset}>
          Reset
        </Button>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-medium">Price range</p>
        <Slider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={50}
          value={[state.maxPrice]}
          onValueChange={(v) => onChange({ ...state, maxPrice: v[0] ?? state.maxPrice })}
        />
        <p className="text-xs text-muted-foreground">
          {inr(priceBounds[0])} – {inr(state.maxPrice)}
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Departure time</p>
        {DEPART_WINDOWS.map((w) => (
          <Row
            key={w.id}
            id={`dep-${w.id}`}
            label={w.label}
            checked={state.departWindows.includes(w.id)}
            onToggle={() => toggle("departWindows", w.id)}
          />
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Max duration</p>
        <Slider
          min={durationBounds[0]}
          max={durationBounds[1]}
          step={15}
          value={[state.maxDuration]}
          onValueChange={(v) => onChange({ ...state, maxDuration: v[0] ?? state.maxDuration })}
        />
        <p className="text-xs text-muted-foreground">
          Up to {Math.floor(state.maxDuration / 60)}h {state.maxDuration % 60}m
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Operators</p>
        {operators.map((op) => (
          <Row
            key={op}
            id={`op-${op}`}
            label={op}
            checked={state.operators.includes(op)}
            onToggle={() => toggle("operators", op)}
          />
        ))}
      </section>

      {showStops && (
        <section className="space-y-3">
          <p className="text-sm font-medium">Stops</p>
          {[
            { id: "0", label: "Non-stop" },
            { id: "1", label: "1 stop" },
            { id: "2", label: "2+ stops" },
          ].map((s) => (
            <Row
              key={s.id}
              id={`stop-${s.id}`}
              label={s.label}
              checked={state.stops.includes(s.id)}
              onToggle={() => toggle("stops", s.id)}
            />
          ))}
        </section>
      )}
    </aside>
  );
}

function Row({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}
