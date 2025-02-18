import axios from 'axios';
import { PlayerHistoryEntry } from '../types/interfaces';

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

  addPlayer: async (
    summonerName: string, 
    playerName: string, 
    role: string,
    isMain: boolean = false 
  ) => {
    const payload = {
      summonerName, 
      playerName, 
      role,
      isMain
    };
    
    console.log('Frontend - Données envoyées à l\'API:', payload);

    try {
      const response = await axios.post(`${API_URL}/api/players`, payload);
      console.log('Frontend - Réponse reçue du serveur:', response.data);
      return response.data;
    } catch (error) {
      console.error('Frontend - Erreur:', error);
      throw error;
    }
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

  deletePlayer: async (summonerName: string) => {
    try {
      console.log('API - URL:', `${API_URL}/api/players/delete`);
      console.log('API - Données envoyées:', { summonerName });
      
      const response = await axios.post(`${API_URL}/api/players/delete`, {
        summonerName
      });
      
      console.log('API - Réponse complète:', response);
      return response.data;
    } catch (error: any) {
      console.error('API - Erreur complète:', error);
      throw error;
    }
  },

  getPlayerHistory: async (playerId: string): Promise<PlayerHistoryEntry[]> => {
    try {
      // console.log("Fetching history for player:", playerId);
      const response = await axios.get(`${API_URL}/api/players/${playerId}/history`);
      // console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching player history:', error);
      throw error;
    }
  },
};