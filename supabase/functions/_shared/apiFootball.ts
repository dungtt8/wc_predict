type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { fullTime: { home: number | null; away: number | null } };
};

export function mapFixturePayload(match: any) {
  // Sử dụng toán tử ?? (nullish coalescing) để gán giá trị mặc định nếu API trả về null
  const homeId = match.homeTeam?.id ?? 0;
  const awayId = match.awayTeam?.id ?? 0;

  return {
    apiSourceId: match.id,
    kickoffAt: match.utcDate,
    status: match.status ?? 'TIMED',
    stage: match.stage ?? 'REGULAR_SEASON',
    homeTeamApiId: Number(homeId), 
    awayTeamApiId: Number(awayId),
    homeTeamName: match.homeTeam?.name ?? "TBD",
    awayTeamName: match.awayTeam?.name ?? "TBD",
    homeScore: match.score?.fullTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? null,
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
