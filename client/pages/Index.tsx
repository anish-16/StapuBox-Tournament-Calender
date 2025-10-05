import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TournamentCalendar } from "@/components/tournament/tournament-calendar";
import { TournamentCard } from "@/components/tournament/tournament-card";
import {
  TournamentCardSkeleton,
  TournamentFilterSkeleton,
} from "@/components/tournament/tournament-skeleton";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTournamentCalendar } from "@/hooks/useTournamentCalendar";
import { formatISTDateFromKey } from "@/lib/date";

const INITIAL_VISIBLE = 5;
const LOAD_MORE_STEP = 4;

export default function Index() {
  const {
    activeMonth,
    canGoNext,
    canGoPrevious,
    goToNextMonth,
    goToPreviousMonth,
    highlightedDateKeys,
    selectedDateKey,
    selectDate,
    sportOptions,
    selectedSportId,
    changeSport,
    tournaments,
    filteredTournaments,
    sportStatus,
    isSportsLoading,
    sportsError,
    isTournamentsLoading,
    isTournamentsFetching,
    tournamentsError,
    refetchSports,
    refetchTournaments,
  } = useTournamentCalendar();

  const activeMonthLabel = useMemo(() => activeMonth.label, [activeMonth.label]);
  const formattedSelectedDate = useMemo(
    () => (selectedDateKey ? formatISTDateFromKey(selectedDateKey) : null),
    [selectedDateKey],
  );

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [filteredTournaments, selectedDateKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return () => undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            filteredTournaments.length > visibleCount
          ) {
            setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, filteredTournaments.length));
          }
        });
      },
      { rootMargin: "120px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filteredTournaments.length, visibleCount]);

  const visibleTournaments = filteredTournaments.slice(0, visibleCount);

  const shouldShowSkeletonFilter = isSportsLoading && sportOptions.length === 0;
  const shouldShowTournamentSkeleton = isTournamentsLoading;
  const hasNoData = !isTournamentsLoading && filteredTournaments.length === 0 && !tournamentsError;

  return (
    <div className="min-h-screen bg-app-gradient px-4 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-16">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-800 sm:text-3xl">
                StapuBox Tournament Calendar
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Track upcoming tournaments, fixtures, and results in real time.
              </p>
            </div>
            <ThemeToggle />
          </div>

          {sportsError ? (
            <div className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-destructive/40 bg-surface/95 p-4 text-left text-sm text-destructive shadow-card sm:mx-0 dark:border-destructive/30 dark:bg-neutral-800/90">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Unable to load sports list</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-300">{sportsError.message}</p>
              </div>
              <button
                type="button"
                onClick={() => refetchSports()}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 dark:bg-brand-400 dark:text-neutral-900 dark:hover:bg-brand-300"
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : null}

          {shouldShowSkeletonFilter ? (
            <TournamentFilterSkeleton />
          ) : (
            <div className="mx-auto w-full max-w-xl sm:mx-0">
              <label className="block text-left text-sm font-medium text-neutral-500">
                Search your sport
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-400" />
                <Select
                  value={String(selectedSportId)}
                  onValueChange={(value) => {
                    const parsed = value === "ALL" ? "ALL" : Number(value);
                    changeSport(parsed);
                  }}
                  disabled={sportStatus === "error"}
                >
                  <SelectTrigger className="h-14 w-full rounded-2xl border border-brand-100/80 bg-surface pl-12 pr-12 text-base font-medium text-neutral-700 shadow-soft dark:border-neutral-600/70 dark:bg-neutral-800/70 dark:text-neutral-100">
                    <SelectValue aria-label="Select sport">
                      {sportOptions.find((option) => String(option.id) === String(selectedSportId))?.label ?? "All Sports"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-brand-100/80 bg-surface shadow-soft dark:border-neutral-600/70 dark:bg-neutral-800/80">
                    {sportOptions.map((option) => (
                      <SelectItem key={`${option.code}-${option.id}`} value={String(option.id)} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </header>

        <TournamentCalendar
          monthLabel={activeMonthLabel}
          monthValue={activeMonth.value}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={goToPreviousMonth}
          onNext={goToNextMonth}
          highlightedDateKeys={highlightedDateKeys}
          selectedDateKey={selectedDateKey}
          onSelectDate={selectDate}
        />

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
                {selectedDateKey ? "Fixtures" : "Tournaments"}
              </h2>
              {formattedSelectedDate ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-300">Showing tournaments starting on {formattedSelectedDate}</p>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-300">Across {activeMonthLabel}</p>
              )}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-300">
              {isTournamentsFetching ? "Refreshing..." : `${filteredTournaments.length} results`}
            </div>
          </div>

          {tournamentsError ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl border border-destructive/30 bg-surface/95 p-6 text-sm text-neutral-600 shadow-card dark:border-destructive/30 dark:bg-neutral-800/90 dark:text-neutral-200">
              <div className="flex items-center gap-2 text-destructive dark:text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Unable to load tournaments</span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-300">{tournamentsError.message}</p>
              <button
                type="button"
                onClick={() => refetchTournaments()}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 dark:bg-brand-400 dark:text-neutral-900 dark:hover:bg-brand-300"
              >
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          ) : null}

          {shouldShowTournamentSkeleton ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <TournamentCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : null}

          {hasNoData ? (
            <div className="rounded-3xl border border-brand-100/70 bg-surface p-10 text-center shadow-card dark:border-neutral-600/60 dark:bg-neutral-800/80">
              <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">No tournaments here yet</p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-300">
                Try selecting another sport or date to explore more fixtures.
              </p>
            </div>
          ) : null}

          <AnimatePresence mode="popLayout">
            {visibleTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
              >
                <TournamentCard tournament={tournament} />
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
        </section>
      </div>
    </div>
  );
}
