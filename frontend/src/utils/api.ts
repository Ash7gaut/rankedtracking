import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://rankedtracking-backend.onrender.com' ;

export const api = {
  getPlayers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/players`);
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  updateAllPlayers: async () => {
    try {
      const response = await axios.post(`${API_URL}/api/players/update-all`);
      return response.data;
    } catch (error) {
      console.error('Error updating all players:', error);
      throw error;
    }
  },

  getPlayerGames: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/players/${id}/games`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player games:', error);
      throw error;
    }
  },

  addPlayer: async (summonerName: string, playerName: string) => {
    const response = await fetch(`${API_URL}/api/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summonerName, playerName }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du joueur");
    }

    return response.json();
  },

  getPlayerById: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player:', error);
      throw error;
    }
  },

  deletePlayer: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }
};