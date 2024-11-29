import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'https://rankedtracking-backend.onrender.com' ;

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
};

export const api = {
  getPlayers: async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${API_URL}/api/players`, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  updateAllPlayers: async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(`${API_URL}/api/players/update-all`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error updating all players:', error);
      throw error;
    }
  },

  getPlayerGames: async (id: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${API_URL}/api/players/${id}/games`, { headers });
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
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(`${API_URL}/api/players`, {
        summonerName, 
        playerName, 
        role,
        isMain
      }, { headers });
      return response.data;
    } catch (error) {
      console.error('Error adding player:', error);
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

  deletePlayer: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/players/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },
};