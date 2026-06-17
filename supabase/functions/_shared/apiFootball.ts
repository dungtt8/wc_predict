type ApiFixtureRow = {
  fixture: { id: number; date: string; status: { short: string } };
  teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  goals: { home: number | null; away: number | null };
  league: { round: string };
};

export function mapFixturePayload(row: ApiFixtureRow) {
  return {
    apiSourceId: row.fixture.id,
    kickoffAt: row.fixture.date,
    status: row.fixture.status.short,
    stage: row.league.round,
    homeTeamApiId: row.teams.home.id,
    awayTeamApiId: row.teams.away.id,
    homeTeamName: row.teams.home.name,
    awayTeamName: row.teams.away.name,
    homeScore: row.goals.home,
    awayScore: row.goals.away,
  };
}

export async function fetchWithRetry(url: string, headers: HeadersInit, maxAttempts = 3) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  throw lastError ?? new Error("Unknown API failure");

}
