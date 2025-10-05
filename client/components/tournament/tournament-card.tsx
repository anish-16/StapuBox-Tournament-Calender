import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  MapPin,
} from "lucide-react";
import {
  StapuboxTournament,
  StapuboxTournamentMatch,
} from "@shared/api";
import {
  formatISTDate,
  formatISTDateRange,
  formatISTTime,
} from "@/lib/date";
import { cn } from "@/lib/utils";

interface TournamentCardProps {
  tournament: StapuboxTournament;
}

function getLevelTone(level: string): string {
  const normalised = level.toLowerCase();
  if (normalised.includes("international")) {
    return "text-level-international";
  }
  if (normalised.includes("domestic")) {
    return "text-level-domestic";
  }
  if (normalised.includes("national")) {
    return "text-level-national";
  }
  return "text-level-generic";
}

function getBadgeLabel(level: string): string {
  if (!level) {
    return "";
  }
  return level
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getMatchTime(match: StapuboxTournamentMatch, fallback: string): string {
  if (match.startDate) {
    return formatISTTime(match.startDate);
  }
  return formatISTTime(fallback);
}

function getMatchDate(match: StapuboxTournamentMatch, fallback: string): string {
  if (match.startDate) {
    return formatISTDate(match.startDate);
  }
  return formatISTDate(fallback);
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const hasMatches = tournament.matches.length > 0;
  const firstMatch = hasMatches ? tournament.matches[0] : null;
  const additionalMatches = useMemo(
    () => (hasMatches ? tournament.matches.slice(1) : []),
    [hasMatches, tournament.matches],
  );

  const levelTone = getLevelTone(tournament.level);
  const badgeLabel = getBadgeLabel(tournament.level);

  return (
    <article
      className={cn(
        "rounded-3xl bg-surface transition dark:bg-neutral-800/70",
        hasMatches
          ? "shadow-card p-5"
          : "border border-brand-100/80 p-4 shadow-none dark:border-neutral-600/60",
      )}
    >
      <header className="flex items-start gap-4">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-brand-200 dark:border-brand-400/60">
          {tournament.imageUrl ? (
            <img
              src={tournament.imageUrl}
              alt={`${tournament.name} crest`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base font-semibold text-brand-700">
              {tournament.sportName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
                {tournament.name}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-300">{tournament.sportName}</p>
            </div>
            <div className="flex items-center gap-3">
              {badgeLabel ? (
                <span className={cn("text-xs font-semibold uppercase tracking-wide", levelTone, "dark:text-brand-200")}>
                  {badgeLabel}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setIsFavourite((prev) => !prev)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border transition",
                  isFavourite
                    ? "border-brand-400 bg-brand-50 text-brand-600 dark:border-brand-300 dark:bg-brand-500/20 dark:text-brand-200"
                    : "border-neutral-200 text-neutral-400 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-brand-300 dark:hover:bg-brand-500/20 dark:hover:text-brand-200",
                )}
                aria-pressed={isFavourite}
                aria-label="Toggle favourite"
              >
                <Heart className={cn("h-4 w-4", isFavourite && "fill-current")} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-300">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-500 dark:text-brand-300" />
              {formatISTDateRange(tournament.startDate, tournament.endDate)}
            </span>
            <span className="inline-flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {tournament.level}
            </span>
          </div>
        </div>
      </header>

      {firstMatch ? (
        <div className="mt-5 rounded-2xl border border-brand-100 bg-surface/95 p-4 shadow-inner dark:border-brand-300/50 dark:bg-neutral-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {firstMatch.teamA} vs {firstMatch.teamB}
            </p>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:border-brand-300/60 dark:bg-brand-500/20 dark:text-brand-200">
              {firstMatch.stage}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-neutral-600 sm:grid-cols-3 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand-500 dark:text-brand-300" />
              <span>{getMatchDate(firstMatch, tournament.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500 dark:text-brand-300" />
              <span>{getMatchTime(firstMatch, tournament.startDate)}</span>
            </div>
            {firstMatch.venue ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                <span>{firstMatch.venue}</span>
              </div>
            ) : null}
          </div>

          {additionalMatches.length > 0 ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-semibold text-brand-600"
              >
                {isExpanded ? "Hide fixtures" : "View more fixtures"}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isExpanded ? (
                <div className="mt-3 space-y-3">
                  {additionalMatches.map((match) => (
                    <div
                      key={match.id}
                      className="rounded-xl border border-brand-50 bg-surface px-4 py-3 shadow-sm dark:border-brand-300/40 dark:bg-neutral-800/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        <span>{match.stage}</span>
                        <span className="text-brand-500">{getMatchDate(match, tournament.startDate)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <span>{match.teamA}</span>
                        <span className="text-neutral-400">vs</span>
                        <span>{match.teamB}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                          {getMatchTime(match, tournament.startDate)}
                        </span>
                        {match.venue ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-brand-500 dark:text-brand-300" />
                            {match.venue}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
