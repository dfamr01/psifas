import { SERVER_URL } from '@/config';
import { HttpClient } from '../utils/httpClient';
import tokenService from './tokenService';

interface PatientDataAddress {
  url: string;
  link_expiration_timestamp_utc: string;
  offset: number;
}

class DataService {
  httpClient = new HttpClient(SERVER_URL);

  async getPatientDataAddresses(offset: number): Promise<PatientDataAddress> {
    const token = await tokenService.getToken();
    try {
      return await this.httpClient.get<PatientDataAddress>('/patients_data_address', { offset }, { Authorization: `Bearer ${token}` });
    } catch (error) {
      console.error('Failed to retrieve patient data addresses:', (error as Error).message);
      throw error;
    }
  }

  async fetchPatientData(url: string): Promise<any> {
    try {
      return await this.httpClient.externalRequest(url, 'get', null, { responseType: 'arraybuffer' });
    } catch (error) {
      console.error('Failed to fetch patient data:', (error as Error).message);
      throw error;
    }
  }

  async sendStatistics(statistics: Record<string, number>): Promise<void> {
    const token = await tokenService.getToken();
    try {
      await this.httpClient.post('/statistics', statistics, { Authorization: `Bearer ${token}` });
    } catch (error) {
      console.error('Failed to send statistics:', (error as Error).message);
      throw error;
    }
  }
}

export default new DataService();
