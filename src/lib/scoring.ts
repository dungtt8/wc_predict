type Score = { home: number; away: number };

export type RankRow = {
  memberId: string;
  totalPoints: number;
  exactHits: number;
  joinedAt: string;
};

const outcome = ({ home, away }: Score) =>
  home === away ? "draw" : home > away ? "home" : "away";

export function scorePrediction(pred: Score, actual: Score) {
  if (pred.home === actual.home && pred.away === actual.away) {
    return { points: 3, exactHit: true, outcomeHit: true };
  }

  if (outcome(pred) === outcome(actual)) {
    return { points: 1, exactHit: false, outcomeHit: true };
  }

  return { points: 0, exactHit: false, outcomeHit: false };
}

export function sortRanking(rows: RankRow[]) {
  return [...rows].sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.exactHits - a.exactHits ||
      Date.parse(a.joinedAt) - Date.parse(b.joinedAt),
  );
}
