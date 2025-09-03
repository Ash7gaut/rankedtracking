import { api } from '../api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlayers', () => {
    it('should fetch players successfully', async () => {
      const mockPlayers = [{ id: '1', summoner_name: 'T50BST1K#0705' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPlayers });

      const result = await api.getPlayers();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/api/players`);
      expect(result).toEqual(mockPlayers);
    });
  });
});
