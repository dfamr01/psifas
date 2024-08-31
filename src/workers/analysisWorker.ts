import { parentPort, workerData } from 'worker_threads';
import dataService from '../services/dataService';
import unzipper from 'unzipper';
import csvParser from 'csv-parser';

interface WorkerData {
  urls: string[];
}

interface PhenotypeCount {
  [key: string]: { description: string; count: number };
}
async function processUrls(urls: string[]): Promise<PhenotypeCount> {
  const phenotypeCounts: PhenotypeCount = {};

  for (const url of urls) {
    try {
      const patientData = await dataService.fetchPatientData(url);

      const zipBuffer = Buffer.from(patientData, 'binary');
      const zip = await unzipper.Open.buffer(zipBuffer);

      const filePromises = zip.files.map(async file => {
        const recordPromise = new Promise<any[]>((resolve, reject) => {
          const results: any[] = [];
          file
            .stream()
            .pipe(csvParser())
            .on('data', row => results.push(row))
            .on('end', () => resolve(results))
            .on('error', error => reject(error));
        });
        return recordPromise;
      });

      const allRecords = await Promise.all(filePromises);

      for (const records of allRecords) {
        // Process the records and update phenotypeCounts
        for (const record of records) {
          const key = record['קוד הבחנה'];
          const phenotype = phenotypeCounts[key];
          if (!phenotype) {
            phenotypeCounts[key] = {
              description: record['תיאור הבחנה'],
              count: 0,
            };
          }
          phenotypeCounts[key].count++;
        }
      }
    } catch (error) {
      console.error(`Error processing URL ${url}:`, (error as Error).message);
    }
  }

  return phenotypeCounts;
}

async function runWorker() {
  const { urls } = workerData as WorkerData;
  const result = await processUrls(urls);
  parentPort?.postMessage(result);
}

runWorker();
