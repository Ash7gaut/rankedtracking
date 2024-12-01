export interface Player {
  id: string;
  summoner_id: string;
  summoner_name: string;
  puuid: string;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  wins?: number;
  losses?: number;
  last_update?: string;
}

export interface Match {
  id: string;
  gameId: string;
  champion: string;
  kills: number;
  deaths: number;
  assists: number;
  result: boolean;
  createdAt: string;
}

export interface Game {
  gameId: string;
  gameCreation: number;
  gameDuration: number;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  allies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
  }>;
  enemies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
  }>;
}

export interface SummonerResponse {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RankedStats {
  leagueId: string;
  queueType: string;
  tier: string | null;
  rank: string | null;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface Participant {
  puuid: string;
  championId: number;
  championName: string;
  summonerName: string;
  teamId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  riotIdGameName?: string;
  riotIdTagline?: string;
}

export interface MatchResponse {
  info: {
    gameCreation: number;
    gameDuration: number;
    queueId: number;
    participants: Participant[];
  };
}

export interface MatchDetails {
  gameId: string;
  gameCreation: number;
  gameDuration: number;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  cs: number;
  summoner1Id: number;
  summoner2Id: number;
  items: number[];
  allies: {
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
  }[];
  enemies: {
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
  }[];
}