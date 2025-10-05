import { RequestHandler } from "express";
import { isSameMonth } from "date-fns";
import {
  StapuboxSport,
  StapuboxSportsResponse,
  StapuboxTournament,
  StapuboxTournamentFilters,
  StapuboxTournamentMatch,
  StapuboxTournamentsResponse,
} from "@shared/api";

const STAPUBOX_BASE_URL = "https://stapubox.com";
const STAPUBOX_TIMEOUT = 15000;

interface StapuboxEnvelope<T> {
  status?: string;
  msg?: string;
  err?: string | null;
  error?: string | null;
  data?: T;
}

interface RemoteSport {
  sport_id: number;
  sport_code: string;
  sport_name: string;
}

interface RemoteTournamentMatch {
  id: number;
  stage: string;
  team_a: string;
  team_b: string;
  start_date: string;
  end_date: string | null;
  venue: string;
  status: string;
}

interface RemoteTournament {
  id: number;
  name: string;
  tournament_img_url: string;
  level: string;
  start_date: string;
  end_date: string;
  matches: RemoteTournamentMatch[] | null;
}

interface RemoteTournamentGroup {
  sport_id: number;
  sport_name: string;
  tournaments: RemoteTournament[] | null;
}

async function stapuboxFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STAPUBOX_TIMEOUT);

  try {
    const headers: Record<string, string> = {};
    if (process.env.STAPUBOX_API_KEY) {
      headers["x-api-key"] = process.env.STAPUBOX_API_KEY;
    }

    const response = await fetch(`${STAPUBOX_BASE_URL}${path}`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Stapubox request failed with ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as StapuboxEnvelope<T>;
    if (json.error) {
      throw new Error(json.error);
    }
    if (json.err) {
      throw new Error(json.err);
    }
    if (!json.data) {
      throw new Error("Stapubox response missing data payload");
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function normaliseSport(remote: RemoteSport): StapuboxSport {
  return {
    id: remote.sport_id,
    code: remote.sport_code,
    name: toTitleCase(remote.sport_name),
  };
}

function parseMonthQuery(month?: string): Date | null {
  if (!month) {
    return null;
  }

  if (/^\d{4}-\d{2}$/.test(month)) {
    const [year, monthIndex] = month.split("-").map(Number);
    if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
      return null;
    }
    return new Date(Date.UTC(year, monthIndex - 1, 1));
  }

  const parsed = new Date(`${month} 1`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), 1));
}

function ensureDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const withZone = value.endsWith("Z") ? value : `${value}Z`;
  const parsed = new Date(withZone);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function normaliseMatch(match: RemoteTournamentMatch): StapuboxTournamentMatch {
  return {
    id: match.id,
    stage: match.stage,
    teamA: match.team_a,
    teamB: match.team_b,
    startDate: match.start_date,
    endDate: match.end_date,
    venue: match.venue,
    status: match.status,
  };
}

function normaliseTournament(
  remote: RemoteTournament,
  group: RemoteTournamentGroup,
): StapuboxTournament {
  return {
    id: remote.id,
    name: remote.name,
    imageUrl: remote.tournament_img_url,
    level: remote.level,
    startDate: remote.start_date,
    endDate: remote.end_date,
    sportId: group.sport_id,
    sportName: toTitleCase(group.sport_name),
    matches: Array.isArray(remote.matches)
      ? remote.matches.map(normaliseMatch)
      : [],
  };
}

function filterTournaments(
  tournaments: StapuboxTournament[],
  filters: StapuboxTournamentFilters,
): StapuboxTournament[] {
  const monthDate = parseMonthQuery(filters.month);
  const sportId = filters.sportId && filters.sportId !== "ALL"
    ? Number(filters.sportId)
    : null;

  return tournaments.filter((tournament) => {
    if (sportId !== null && tournament.sportId !== sportId) {
      return false;
    }

    if (!monthDate) {
      return true;
    }

    const start = ensureDate(tournament.startDate);
    if (!start) {
      return false;
    }

    return isSameMonth(start, monthDate);
  });
}

export const getStapuboxSports: RequestHandler = async (_req, res) => {
  try {
    const sports = await stapuboxFetch<RemoteSport[]>("/sportslist");
    const normalised = sports.map(normaliseSport).sort((a, b) => a.name.localeCompare(b.name));

    const payload: StapuboxSportsResponse = {
      sports: normalised,
    };

    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(502).json({ message });
  }
};

export const getStapuboxTournaments: RequestHandler = async (req, res) => {
  try {
    const data = await stapuboxFetch<RemoteTournamentGroup[]>("/tournament/demo");

    const allTournaments: StapuboxTournament[] = data.flatMap((group) => {
      if (!Array.isArray(group.tournaments)) {
        return [];
      }
      return group.tournaments.map((tournament) => normaliseTournament(tournament, group));
    });

    const filters: StapuboxTournamentFilters = {
      month: typeof req.query.month === "string" ? req.query.month : undefined,
      sportId: typeof req.query.sportId === "string"
        ? req.query.sportId
        : typeof req.query.sportsId === "string"
          ? req.query.sportsId
          : undefined,
    };

    const filtered = filterTournaments(allTournaments, filters);
    const payload: StapuboxTournamentsResponse = {
      tournaments: filtered,
    };

    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(502).json({ message });
  }
};
