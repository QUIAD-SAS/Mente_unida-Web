import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";

const week = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthOf(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  if (!year || !month) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  return { year, month: month - 1 };
}

export function MonthCalendar({
  marked,
  selected,
  onSelect,
}: {
  marked: string[];
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const [cursor, setCursor] = useState(() => monthOf(selected));

  useEffect(() => {
    setCursor(monthOf(selected));
  }, [selected]);
  const first = new Date(cursor.year, cursor.month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const days = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells = [...Array.from({ length: startPad }, () => ""), ...Array.from({ length: days }, (_, index) => String(index + 1))];
  const label = first.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  function shift(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-display text-base font-semibold text-ink capitalize">{label}</p>
        <div className="flex gap-1">
          <button type="button" aria-label="Mes anterior" onClick={() => shift(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-surface-mid">
            <Icon name="chevron_left" className="text-[22px]" />
          </button>
          <button type="button" aria-label="Mes siguiente" onClick={() => shift(1)} className="flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-surface-mid">
            <Icon name="chevron_right" className="text-[22px]" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-soft sm:gap-1.5 sm:text-sm">
        {week.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (!day) return <span key={`e${index}`} />;
          const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
          const active = iso === selected;
          const has = marked.includes(iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`relative flex h-10 items-center justify-center rounded-lg font-display text-sm transition sm:h-11 ${
                active ? "bg-primary-container text-white" : "text-ink hover:bg-surface-mid"
              }`}
            >
              {day}
              {has ? <span className={`absolute bottom-1 h-1 w-1 rounded-full ${active ? "bg-white" : "bg-secondary"}`} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
