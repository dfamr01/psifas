import axios, { AxiosInstance, AxiosResponse } from 'axios';

type ExternalRequestMethod = 'get' | 'post';

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL: baseURL,
    });
  }

  async externalRequest<T>(url: string, method: ExternalRequestMethod = 'get', data?: any, config?: any): Promise<T> {
    try {
      const request = {
        url,
        method,
        ...config,
      };

      if (data && Object.keys(data).length > 0) {
        request.data = data;
      }

      const response: AxiosResponse<T> = await axios(request);
      return response.data;
    } catch (error) {
      console.error(`Error in ${method.toUpperCase()} request to ${url}:`, (error as Error).message);
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
