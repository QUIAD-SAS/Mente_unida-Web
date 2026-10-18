import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface ScheduleCalendarProps {
  month: Date;
  availableDates: Set<string>;
  selectedDate: string | null;
  loading?: boolean;
  compact?: boolean;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: string) => void;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);

  // Lunes = 0 … Domingo = 6
  const startPad = (first.getDay() + 6) % 7;
  const days: Date[] = [];

  for (let i = startPad; i > 0; i--) {
    days.push(new Date(year, monthIndex, 1 - i));
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, monthIndex, d));
  }
  while (days.length % 7 !== 0) {
    const next = days.length - startPad - last.getDate() + 1;
    days.push(new Date(year, monthIndex + 1, next));
  }

  return days;
}

export function monthRange(date: Date): { from: string; to: string } {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const now = new Date();
  const start = monthStart < now ? now : monthStart;
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { from: start.toISOString(), to: end.toISOString() };
}

export function ScheduleCalendar({
  month,
  availableDates,
  selectedDate,
  loading,
  compact = false,
  onMonthChange,
  onSelectDate,
}: ScheduleCalendarProps) {
  const todayKey = toDateKey(new Date());
  const currentMonthIndex = month.getMonth();
  const monthLabel = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(month);

  function shiftMonth(delta: number) {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }

  const days = buildMonthGrid(month);

  return (
    <div
      className={cn(
        "rounded-mu border border-mu-border bg-mu-surface",
        compact ? "p-3" : "p-4",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={loading}
          className="rounded-mu p-1.5 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text disabled:opacity-50"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <p
          className={cn(
            "font-medium capitalize text-mu-text",
            compact ? "text-sm" : "text-base",
          )}
        >
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={loading}
          className="rounded-mu p-2 text-mu-text-muted hover:bg-mu-accent hover:text-mu-text disabled:opacity-50"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-mu-text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1 font-medium">
            {label}
          </span>
        ))}
      </div>

      <div
        className="mt-1 grid grid-cols-7 gap-1"
        role="grid"
        aria-label="Calendario de disponibilidad"
      >
        {days.map((day) => {
          const key = toDateKey(day);
          const inMonth = day.getMonth() === currentMonthIndex;
          const available = availableDates.has(key);
          const selected = selectedDate === key;
          const isToday = key === todayKey;

          const isPast = key < todayKey;
          const selectable = inMonth && available && !isPast;

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              disabled={!selectable || loading}
              onClick={() => onSelectDate(key)}
              aria-pressed={selected}
              aria-label={new Intl.DateTimeFormat("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(day)}
              className={cn(
                compact
                  ? "h-8 rounded-mu text-xs"
                  : "aspect-square rounded-mu text-sm",
                "transition-colors",
                !inMonth && "invisible",
                inMonth &&
                  (!available || isPast) &&
                  "cursor-not-allowed text-mu-text-muted/40",
                selectable &&
                  !selected &&
                  "bg-mu-accent/60 font-medium text-mu-primary hover:bg-mu-accent",
                selected && "bg-mu-primary font-semibold text-white",
                isToday && !selected && selectable && "ring-1 ring-mu-primary/40",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {!compact ? (
        <p className="mt-3 text-xs text-mu-text-muted">
          Solo puedes elegir fechas resaltadas con disponibilidad confirmada.
        </p>
      ) : null}
    </div>
  );
}

export { toDateKey };
