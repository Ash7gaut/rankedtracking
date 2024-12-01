import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "react-query";
import { api } from "../../../../utils/api";

interface PlayerHistoryEntry {
  id: string;
  player_id: string;
  tier: string;
  rank: string;
  league_points: number;
  wins: number;
  losses: number;
  timestamp: string;
}

export const PlayerHistory = ({ playerId }: { playerId: string }) => {
  const { data: history, isLoading } = useQuery<PlayerHistoryEntry[]>(
    ["playerHistory", playerId],
    () => api.getPlayerHistory(playerId)
  );

  console.log("History data:", history);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse flex flex-col items-center justify-center h-64">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const data = history?.map((entry) => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    lp: entry.league_points,
  }));

  console.log("Formatted data:", data);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Évolution des LP
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="lp"
              stroke="#3B82F6"
              fill="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
