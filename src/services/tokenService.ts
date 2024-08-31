import httpClient from '@/utils/httpClient';
import { EMAIL } from '../config/index';

interface TokenResponse {
  bearer_token: string;
}

class TokenService {
  private token: string | null = null;

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    try {
      const response = await httpClient.get<TokenResponse>('/token', { email: EMAIL });
      this.token = response.bearer_token;
      return this.token;
    } catch (error) {
      console.error('Failed to retrieve token:', (error as Error).message);
      throw error;
    }
  }
}

export default new TokenService();
