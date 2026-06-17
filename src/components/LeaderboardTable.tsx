import { RankingRow } from "../lib/types";

type LeaderboardTableProps = {
  rows: RankingRow[];
};

export default function LeaderboardTable({ rows }: LeaderboardTableProps) {
  if (rows.length === 0) {
    return <p className="text-center text-gray-500 py-4">Chưa có dữ liệu xếp hạng.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <th className="px-6 py-3 font-semibold">Rank</th>
            <th className="px-6 py-3 font-semibold">Player</th>
            <th className="px-6 py-3 font-semibold text-center">Points</th>
            <th className="px-6 py-3 font-semibold text-center">Exact Hits</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, index) => {
            // Highlight top 3
            const isTop3 = index < 3;
            const rankStyles = isTop3
              ? "font-bold text-blue-600 bg-blue-50"
              : "text-gray-700";

            return (
              <tr
                key={row.memberId}
                className={`hover:bg-gray-50 transition-colors ${isTop3 ? "bg-blue-50/30" : ""}`}
              >
                <td className={`px-6 py-4 font-mono ${rankStyles}`}>
                  #{index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {row.nickname}
                </td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">
                  {row.totalPoints}
                </td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {row.exactHits}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}