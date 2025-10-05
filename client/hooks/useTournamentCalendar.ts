import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  StapuboxSport,
  StapuboxTournament,
} from "@shared/api";
import {
  fetchStapuboxSports,
  fetchStapuboxTournaments,
} from "@/services/stapubox";
import { getISTDateKey } from "@/lib/date";

export type SportSelection = number | "ALL";

interface CalendarMonth {
  label: string;
  value: string; 
}

const CALENDAR_MONTHS: CalendarMonth[] = [
  { label: "Aug 2025", value: "2025-08" },
  { label: "Sep 2025", value: "2025-09" },
  { label: "Oct 2025", value: "2025-10" },
];

interface SportOption {
  id: SportSelection;
  label: string;
  code: string;
}

function buildSportOptions(sports: StapuboxSport[] | undefined): SportOption[] {
  const base: SportOption[] = [{ id: "ALL", label: "All Sports", code: "ALL" }];

  if (!sports || sports.length === 0) {
    return base;
  }

  const sorted = [...sports].sort((a, b) => a.name.localeCompare(b.name));
  return [
    ...base,
    ...sorted.map((sport) => ({ id: sport.id, label: sport.name, code: sport.code })),
  ];
}

function getMonth(index: number): CalendarMonth {
  return CALENDAR_MONTHS[Math.min(Math.max(index, 0), CALENDAR_MONTHS.length - 1)];
}

export function useTournamentCalendar() {
  const [selectedSportId, setSelectedSportId] = useState<SportSelection>("ALL");
  const [monthIndex, setMonthIndex] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const sportsQuery = useQuery({
    queryKey: ["stapubox", "sports"],
    queryFn: fetchStapuboxSports,
    staleTime: 1000 * 60 * 60,
  });

  const sportOptions = useMemo(() => buildSportOptions(sportsQuery.data), [sportsQuery.data]);

  const activeMonth = getMonth(monthIndex);

  const tournamentsQuery = useQuery<StapuboxTournament[]>({
    queryKey: ["stapubox", "tournaments", activeMonth.value, selectedSportId],
    queryFn: () =>
      fetchStapuboxTournaments({
        month: activeMonth.value,
        sportId: selectedSportId,
      }),
    staleTime: 1000 * 60,
    enabled: Boolean(activeMonth.value),
  });

  useEffect(() => {
    setSelectedDateKey(null);
  }, [activeMonth.value, selectedSportId]);

  const tournaments = tournamentsQuery.data ?? [];

  const highlightedDateKeys = useMemo(() => {
    const dates = new Set<string>();
    tournaments.forEach((tournament) => {
      try {
        dates.add(getISTDateKey(tournament.startDate));
      } catch {
        
      }
    });
    return dates;
  }, [tournaments]);

  const filteredTournaments = useMemo(() => {
    if (!selectedDateKey) {
      return tournaments;
    }
    return tournaments.filter((tournament) => {
      try {
        return getISTDateKey(tournament.startDate) === selectedDateKey;
      } catch {
        return false;
      }
    });
  }, [tournaments, selectedDateKey]);

  const selectDate = useCallback((dateKey: string | null) => {
    setSelectedDateKey((current) => {
      if (!dateKey) {
        return null;
      }
      return current === dateKey ? null : dateKey;
    });
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setMonthIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonthIndex((prev) => Math.min(prev + 1, CALENDAR_MONTHS.length - 1));
  }, []);

  const changeSport = useCallback((sportId: SportSelection) => {
    setSelectedSportId(sportId);
  }, []);

  return {
    months: CALENDAR_MONTHS,
    monthIndex,
    activeMonth,
    canGoPrevious: monthIndex > 0,
    canGoNext: monthIndex < CALENDAR_MONTHS.length - 1,
    goToPreviousMonth,
    goToNextMonth,
    tournaments,
    filteredTournaments,
    highlightedDateKeys,
    selectedDateKey,
    selectDate,
    sportOptions,
    selectedSportId,
    changeSport,
    sportStatus: sportsQuery.status,
    isSportsLoading: sportsQuery.isLoading,
    sportsError: sportsQuery.error as Error | null,
    refetchSports: sportsQuery.refetch,
    tournamentsStatus: tournamentsQuery.status,
    isTournamentsLoading: tournamentsQuery.isLoading,
    isTournamentsFetching: tournamentsQuery.isFetching,
    tournamentsError: tournamentsQuery.error as Error | null,
    refetchTournaments: tournamentsQuery.refetch,
  };
}
