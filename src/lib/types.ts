export type RoomCode = string;

export interface RoomSession {
  roomId: string;
  roomCode: RoomCode;
  memberId: string;
  nickname: string;
}

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: string;
}

export interface PredictionInput {
  fixtureId: string;
  predHome: number;
  predAway: number;
}

export interface RankingRow {
  memberId: string;
  nickname: string;
  totalPoints: number;
  exactHits: number;
  joinedAt: string;
}
