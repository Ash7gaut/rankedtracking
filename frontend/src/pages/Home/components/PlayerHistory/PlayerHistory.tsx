import { useQuery } from "react-query";
import { api } from "../../../../utils/api";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  ChartOptions,
  ScaleType,
  Scale,
  CoreScaleOptions,
} from "chart.js";

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

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
    const day = date.getDate().toString().padStart(2, "0");

    const months = [
      "jan.",
      "fév.",
      "mars",
      "avr.",
      "mai",
      "juin",
      "juil.",
      "août",
      "sept.",
      "oct.",
      "nov.",
      "déc.",
    ];
    const month = months[date.getMonth()];

    return `${day} ${month} ${hours}:${minutes}`;
  };

  const calculateTotalValue = (tier: string, rank: string, lp: number) => {
    const tierValue = TIER_VALUES[tier as keyof typeof TIER_VALUES] || 0;
    const rankValue = RANK_VALUES[rank as keyof typeof RANK_VALUES] || 0;

    // Si c'est Master ou au-dessus, les LP sont plus importants
    if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
      return tierValue + lp;
    }

    // Pour les autres tiers, on ajoute le rang et les LP
    return tierValue + rankValue + lp;
  };

  const data = history?.map((entry) => ({
    date: formatDate(entry.timestamp),
    value: calculateTotalValue(entry.tier, entry.rank, entry.league_points),
    tier: entry.tier,
    rank: entry.rank,
    lp: entry.league_points,
  }));

  const chartData = {
    labels: data?.map((d) => d.date),
    datasets: [
      {
        label: "Rang",
        data: data?.map((d) => d.value),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataPoint = data?.[context.dataIndex];
            return `${dataPoint?.tier} ${dataPoint?.rank} ${dataPoint?.lp}LP`;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        position: "left" as const,
        ticks: {
          callback: function (
            this: Scale<CoreScaleOptions>,
            value: number | string
          ) {
            if (typeof value === "number") {
              return formatYAxis(value);
            }
            return value;
          },
          stepSize: 400,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        min: Math.min(...(data?.map((d) => d.value) || [0])) - 200,
        max: Math.max(...(data?.map((d) => d.value) || [0])) + 200,
      },
      x: {
        type: "category" as const,
        position: "bottom" as const,
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const tiers = history?.map((entry) => entry.tier) || [];
  const uniqueTiers = Array.from(new Set(tiers));

  const formatYAxis = (value: number) => {
    const nearestTier = Object.entries(TIER_VALUES).reduce(
      (prev, [tier, tierValue]) => {
        if (Math.abs(tierValue - value) < Math.abs(prev.value - value)) {
          return { tier, value: tierValue };
        }
        return prev;
      },
      { tier: "IRON", value: 0 }
    );

    return nearestTier.tier;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-[448px]">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
        Évolution du rang
      </h2>
      <div className="h-[calc(100%-4rem)]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
