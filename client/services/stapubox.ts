import {
  StapuboxSport,
  StapuboxSportsResponse,
  StapuboxTournament,
  StapuboxTournamentFilters,
  StapuboxTournamentsResponse,
} from "@shared/api";

const API_BASE = "/api/stapubox";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function fetchStapuboxSports(): Promise<StapuboxSport[]> {
  const response = await fetch(`${API_BASE}/sports`);
  const data = await parseJson<StapuboxSportsResponse>(response);
  return data.sports;
}

interface TournamentFetchFilters extends StapuboxTournamentFilters {
  month: string;
}

export async function fetchStapuboxTournaments(
  filters: TournamentFetchFilters,
): Promise<StapuboxTournament[]> {
  const params = new URLSearchParams();

  if (filters.month) {
    params.set("month", filters.month);
  }

  if (filters.sportId && filters.sportId !== "ALL") {
    params.set("sportId", String(filters.sportId));
  }

  const response = await fetch(`${API_BASE}/tournaments?${params.toString()}`);
  const data = await parseJson<StapuboxTournamentsResponse>(response);
  return data.tournaments;
}
