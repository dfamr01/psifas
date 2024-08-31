import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { SERVER_URL } from '../config';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: SERVER_URL,
    });
  }

  async getFileToDownload<T>(url: string) {
    try {
      const response: AxiosResponse<T> = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      console.error(`Error in GET request to ${url}:`, (error as Error).message);
      throw error;
    }
  }

  async get<T>(url: string, params: Record<string, any> = {}, headers: Record<string, string> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, { params, headers });
      return response.data;
    } catch (error) {
      console.error(`Error in GET request to ${url}:`, (error as Error).message);
      throw error;
    }
  }

  async post<T>(url: string, data: any, headers: Record<string, string> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error in POST request to ${url}:`, (error as Error).message);
      throw error;
    }
  }
}

export default new HttpClient();
