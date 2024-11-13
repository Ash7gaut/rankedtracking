import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface Api {
  getPlayers: () => Promise<any>;
  addPlayer: (summonerName: string) => Promise<any>;
  getPlayerById: (id: string) => Promise<any>;
  deletePlayer: (id: string) => Promise<any>;
  getPlayerGames: (id: string) => Promise<any>;
  updateAllPlayers: () => Promise<any>;
}

export const api: Api = {
  getPlayers: async () => {
    try {
      const response = await axios.get(`${API_URL}/players`);
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  updateAllPlayers: async () => {
    try {
      const response = await axios.post(`${API_URL}/players/update-all`);
      return response.data;
    } catch (error) {
      console.error('Error updating all players:', error);
      throw error;
    }
  },

  getPlayerGames: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/players/${id}/games`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player games:', error);
      throw error;
    }
  },

  addPlayer: async (summonerName: string) => {
    try {
      const response = await axios.post(`${API_URL}/players`, { summonerName });
      return response.data;
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  },

  getPlayerById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player:', error);
      throw error;
    }
  },

  deletePlayer: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }
};

export type { Api };