type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { fullTime: { home: number | null; away: number | null } };
};

export function mapFixturePayload(match: FootballDataMatch) {
  return {
    apiSourceId: match.id,
    kickoffAt: match.utcDate,
    status: match.status,
    stage: match.stage,
    homeTeamApiId: match.homeTeam.id,
    awayTeamApiId: match.awayTeam.id,
    homeTeamName: match.homeTeam.name,
    awayTeamName: match.awayTeam.name,
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
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
