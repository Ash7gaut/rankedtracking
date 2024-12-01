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

const TIER_VALUES = {
  IRON: 0,
  BRONZE: 400,
  SILVER: 800,
  GOLD: 1200,
  PLATINUM: 1600,
  EMERALD: 2000,
  DIAMOND: 2400,
  MASTER: 2800,
  GRANDMASTER: 3200,
  CHALLENGER: 3600,
};

const RANK_VALUES = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

export const PlayerHistory = ({ playerId }: { playerId: string }) => {
  const { data: history, isLoading } = useQuery<PlayerHistoryEntry[]>(
    ["playerHistory", playerId],
    () => api.getPlayerHistory(playerId)
  );

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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${date.toLocaleDateString()} ${hours}:${minutes}`;
  };

  const data = history?.map((entry) => {
    const totalValue =
      (TIER_VALUES[entry.tier as keyof typeof TIER_VALUES] || 0) +
      (RANK_VALUES[entry.rank as keyof typeof RANK_VALUES] || 0) +
      entry.league_points;

    return {
      date: formatDate(entry.timestamp),
      value: totalValue,
      tier: entry.tier,
      rank: entry.rank,
      lp: entry.league_points,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
          <p className="text-sm text-gray-900 dark:text-white">{data.date}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {data.tier} {data.rank} {data.lp} LP
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    const tier =
      Object.entries(TIER_VALUES).find(
        ([_, tierValue]) => value >= tierValue
      )?.[0] || "IRON";

    return tier;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Évolution du rang
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7280" }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: "#6B7280" }}
              domain={["dataMin - 100", "dataMax + 100"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
