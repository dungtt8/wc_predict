import { RankingRow } from "../lib/types";

type LeaderboardTableProps = {
  rows: RankingRow[];
};

export default function LeaderboardTable({ rows }: LeaderboardTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Points</th>
          <th>Exact Hits</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.memberId}>
            <td>{index + 1}</td>
            <td>{row.nickname}</td>
            <td>{row.totalPoints}</td>
            <td>{row.exactHits}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
