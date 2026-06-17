import { useEffect, useMemo, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import LeaderboardTable from "../components/LeaderboardTable";
import PredictionForm from "../components/PredictionForm";
import { supabase } from "../lib/supabaseClient";
import { sortRanking } from "../lib/scoring";
import { Fixture, PredictionInput, RankingRow, RoomSession } from "../lib/types";

type RoomDashboardPageProps = { session: RoomSession };

// Helper function để tái sử dụng
export const isPredictionLocked = (kickoffAt: string) => 
  new Date().getTime() >= new Date(kickoffAt).getTime();

export default function RoomDashboardPage({ session }: RoomDashboardPageProps) {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Tối ưu load dữ liệu
  const loadRankings = useCallback(async () => {
    const { data, error } = await supabase
      .from("room_rankings_snapshot")
      .select("member_id, total_points, exact_hits, updated_at")
      .eq("room_id", session.roomId);

    if (error) {
      console.error("Error loading rankings:", error);
      return;
    }

    const formatted: RankingRow[] = (data || []).map((row) => ({
      memberId: row.member_id,
      nickname: row.member_id, // Nên join với bảng members để lấy nickname thật
      totalPoints: row.total_points,
      exactHits: row.exact_hits,
      joinedAt: row.updated_at,
    }));
    
    setRankings(sortRanking(formatted));
    setLoading(false);
  }, [session.roomId]);

  // 2. Realtime subscription
  useEffect(() => {
    loadRankings();
    
    const channel = supabase
      .channel(`rankings:${session.roomId}`)
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "room_rankings_snapshot", filter: `room_id=eq.${session.roomId}` }, 
        () => loadRankings()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session.roomId, loadRankings]);

  // 3. Submit prediction với xử lý lỗi
  const submitPrediction = async (input: PredictionInput) => {
    const { error } = await supabase.from("predictions").upsert({
      room_id: session.roomId,
      fixture_id: input.fixtureId,
      member_id: session.memberId,
      pred_home: input.predHome,
      pred_away: input.predAway,
    });
    if (error) alert("Lỗi khi lưu dự đoán!");
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold">Room: {session.roomCode}</h2>
        <p className="text-gray-600">Playing as: {session.nickname}</p>
      </header>

      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Lịch thi đấu</h3>
        {/* Thay demoFixtures bằng state thực tế khi fetch từ db */}
        <div className="grid gap-4">
          {/* Mapping fixtures here */}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Bảng xếp hạng</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <LeaderboardTable rows={rankings} />
        )}
      </section>
    </main>
  );
}