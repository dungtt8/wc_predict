import { useEffect, useMemo, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import LeaderboardTable from "../components/LeaderboardTable";
import PredictionForm from "../components/PredictionForm";
import { supabase } from "../lib/supabaseClient";
import { sortRanking } from "../lib/scoring";
import { Fixture, PredictionInput, RankingRow, RoomSession } from "../lib/types";

type RoomDashboardPageProps = {
  session: RoomSession;
};

export function isPredictionLocked(kickoffAt: string, nowIso = new Date().toISOString()) {
  return Date.parse(nowIso) >= Date.parse(kickoffAt);
}

export function createLeaderboardChannel(
  roomId: string,
  onUpdate: () => void,
): RealtimeChannel {
  return supabase
    .channel(`rankings:${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "room_rankings_snapshot", filter: `room_id=eq.${roomId}` },
      onUpdate,
    )
    .subscribe();
}

const demoFixtures: Fixture[] = [
  {
    id: "fixture-1",
    homeTeam: "Team A",
    awayTeam: "Team B",
    kickoffAt: "2026-06-12T19:00:00Z",
    status: "NS",
  },
];

const demoRankings: RankingRow[] = [
  {
    memberId: "member-1",
    nickname: "Host",
    totalPoints: 0,
    exactHits: 0,
    joinedAt: "2026-01-01T00:00:00Z",
  },
];

export default function RoomDashboardPage({ session }: RoomDashboardPageProps) {
  const [fixtures] = useState<Fixture[]>(demoFixtures);
  const [rankings, setRankings] = useState<RankingRow[]>(demoRankings);

  useEffect(() => {
    const channel = createLeaderboardChannel(session.roomId, () => {
      void loadRankings();
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session.roomId]);

  async function loadRankings() {
    const { data, error } = await supabase
      .from("room_rankings_snapshot")
      .select("member_id,total_points,exact_hits,updated_at")
      .eq("room_id", session.roomId);

    if (error || !data) return;

    const nextRows: RankingRow[] = data.map((row) => ({
      memberId: row.member_id,
      nickname: row.member_id,
      totalPoints: row.total_points,
      exactHits: row.exact_hits,
      joinedAt: row.updated_at,
    }));
    setRankings(sortRanking(nextRows));
  }

  async function submitPrediction(input: PredictionInput) {
    await supabase.from("predictions").upsert({
      room_id: session.roomId,
      fixture_id: input.fixtureId,
      member_id: session.memberId,
      pred_home: input.predHome,
      pred_away: input.predAway,
    });
  }

  const orderedRankings = useMemo(() => {
    const byId = new Map(rankings.map((row) => [row.memberId, row]));
    return sortRanking(
      rankings.map((row) => ({
        memberId: row.memberId,
        totalPoints: row.totalPoints,
        exactHits: row.exactHits,
        joinedAt: row.joinedAt,
      })),
    )
      .map((row) => byId.get(row.memberId))
      .filter((row): row is RankingRow => Boolean(row));
  }, [rankings]);

  return (
    <main>
      <h2>Room Dashboard: {session.roomCode}</h2>
      <p>Playing as: {session.nickname}</p>

      <section>
        <h3>Fixtures</h3>
        {fixtures.map((fixture) => {
          const locked = isPredictionLocked(fixture.kickoffAt);
          return (
            <article key={fixture.id} style={{ marginBottom: 12 }}>
              <p>
                {fixture.homeTeam} vs {fixture.awayTeam}
              </p>
              <small>{new Date(fixture.kickoffAt).toLocaleString()}</small>
              <PredictionForm
                fixtureId={fixture.id}
                disabled={locked}
                onSubmitPrediction={submitPrediction}
              />
            </article>
          );
        })}
      </section>

      <section>
        <h3>Leaderboard</h3>
        <LeaderboardTable rows={orderedRankings} />
      </section>
    </main>
  );
}
