export interface Player {
  id: string;
  summoner_id: string;
  summoner_name: string;
  player_name: string;
  role: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  is_main: boolean;
  puuid: string;
  profile_icon_id: number;
  tier?: string;
  rank?: string;
  league_points?: number;
  wins?: number;
  losses?: number;
  last_update?: string;
  in_game?: boolean;
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
  gameMode: string;
  gameType: string;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  cs: number;
  summoner1Id: number;
  summoner2Id: number;
  items: number[];
  lpChange?: number;
  allies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
    kills: number;
    deaths: number;
    assists: number;
    visionScore: number;
    cs: number;
  }>;
  enemies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
    kills: number;
    deaths: number;
    assists: number;
    visionScore: number;
    cs: number;
  }>;
}


/////


// Interfaces pour l'API Riot
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
  visionScore: number;
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
  challenges?: {
    [key: string]: number;
  };
  baronKills?: number;
  bountyLevel?: number;
  champExperience?: number;
  champLevel?: number;
  doubleKills?: number;
  dragonKills?: number;
  firstBloodAssist?: boolean;
  firstBloodKill?: boolean;
  firstTowerAssist?: boolean;
  firstTowerKill?: boolean;
  gameEndedInEarlySurrender?: boolean;
  gameEndedInSurrender?: boolean;
  goldEarned?: number;
  goldSpent?: number;
  individualPosition?: string;
  inhibitorKills?: number;
  inhibitorTakedowns?: number;
  inhibitorsLost?: number;
  lane?: string;
  largestCriticalStrike?: number;
  largestKillingSpree?: number;
  largestMultiKill?: number;
  longestTimeSpentLiving?: number;
  magicDamageDealt?: number;
  magicDamageDealtToChampions?: number;
  magicDamageTaken?: number;
  pentaKills?: number;
  physicalDamageDealt?: number;
  physicalDamageDealtToChampions?: number;
  physicalDamageTaken?: number;
  quadraKills?: number;
  role?: string;
  teamPosition?: string;
  timeCCingOthers?: number;
  timePlayed?: number;
  tripleKills?: number;
  trueDamageDealt?: number;
  trueDamageDealtToChampions?: number;
  trueDamageTaken?: number;
  turretKills?: number;
  turretTakedowns?: number;
  turretsLost?: number;
  unrealKills?: number;
  wardsKilled?: number;
  wardsPlaced?: number;
}

export interface MatchResponse {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    gameType: string;
    gameVersion: string;
    mapId: number;
    queueId: number;
    participants: Array<{
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
      visionScore: number;
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
    }>;
  };
}

export interface MatchDetails {
  gameId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  gameType: string;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  visionScore: number;
  cs: number;
  summoner1Id: number;
  summoner2Id: number;
  items: number[];
  allies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
    kills: number;
    deaths: number;
    assists: number;
    visionScore: number;
    cs: number;
  }>;
  enemies: Array<{
    championId: number;
    championName: string;
    summonerName: string;
    totalDamageDealtToChampions: number;
    kills: number;
    deaths: number;
    assists: number;
    visionScore: number;
    cs: number;
  }>;
}

export interface PlayerHistoryEntry {
  id: string;
  player_id: string;
  tier: string;
  rank: string;
  league_points: number;
  wins: number;
  losses: number;
  timestamp: string;
}