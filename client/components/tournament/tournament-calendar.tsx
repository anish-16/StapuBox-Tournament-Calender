import { ChevronLeft, ChevronRight } from "lucide-react";
import { getISTDateKeyFromDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const TOTAL_CELLS = 42;

export interface TournamentCalendarProps {
  monthLabel: string;
  monthValue: string; 
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  highlightedDateKeys: Set<string>;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
}

interface CalendarDayCell {
  key: string;
  label: string;
  isCurrentMonth: boolean;
}

function createCalendarDays(monthValue: string): CalendarDayCell[] {
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr); 

  if (Number.isNaN(year) || Number.isNaN(month)) {
    throw new Error(`Invalid month value: ${monthValue}`);
  }

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; 

  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < TOTAL_CELLS; index += 1) {
    const current = new Date(firstOfMonth);
    current.setUTCDate(current.getUTCDate() + (index - firstWeekday));

    const key = getISTDateKeyFromDate(current);
    const label = String(current.getUTCDate());
    const isCurrentMonth = current.getUTCMonth() === firstOfMonth.getUTCMonth();

    cells.push({ key, label, isCurrentMonth });
  }

  return cells;
}

export function TournamentCalendar(props: TournamentCalendarProps) {
  const {
    monthLabel,
    monthValue,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    highlightedDateKeys,
    selectedDateKey,
    onSelectDate,
  } = props;

  const cells = createCalendarDays(monthValue);

  return (
    <section className="rounded-3xl bg-surface shadow-card p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-brand-600 transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-lg font-semibold text-neutral-900 sm:text-xl">{monthLabel}</p>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-brand-600 transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </header>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {WEEKDAYS.map((weekday, index) => (
          <span key={`${weekday}-${index}`}>{weekday}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          const isHighlighted = highlightedDateKeys.has(cell.key);
          const isSelected = selectedDateKey === cell.key;
          const isInactive = !cell.isCurrentMonth;

          return (
            <button
              type="button"
              key={cell.key}
              onClick={() => onSelectDate(cell.key)}
              disabled={isInactive}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isInactive && "text-neutral-300 cursor-default",
                isHighlighted && "text-brand-700",
                isHighlighted && !isInactive && "bg-brand-50",
                isSelected && "bg-brand-500 text-white shadow-sm",
              )}
            >
              <span>{cell.label}</span>
              {isHighlighted && !isSelected && (
                <span className="absolute inset-0 rounded-full border-2 border-brand-200" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
