
export interface DemoResponse {
  message: string;
}

export interface StapuboxSport {
  id: number;
  code: string;
  name: string;
}

export interface StapuboxSportsResponse {
  sports: StapuboxSport[];
}

export interface StapuboxTournamentMatch {
  id: number;
  stage: string;
  teamA: string;
  teamB: string;
  startDate: string;
  endDate: string | null;
  venue: string;
  status: string;
}

export interface StapuboxTournament {
  id: number;
  name: string;
  imageUrl: string;
  level: string;
  startDate: string;
  endDate: string;
  sportId: number;
  sportName: string;
  matches: StapuboxTournamentMatch[];
}

export interface StapuboxTournamentFilters {
  sportId?: number | "ALL";
  month?: string;
}

export interface StapuboxTournamentsResponse {
  tournaments: StapuboxTournament[];
}
