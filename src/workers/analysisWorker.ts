/**
 * Worker script for processing patient data from ZIP files containing CSV data.
 * @module PatientDataWorker
 */

import { parentPort, workerData } from 'worker_threads';
import dataService from '../services/dataService';
import unzipper from 'unzipper';
import csvParser from 'csv-parser';

/**
 * Structure of the data passed to the worker.
 * @interface WorkerData
 */
interface WorkerData {
  /** Array of URLs to fetch patient data from */
  urls: string[];
}

/**
 * Structure to store phenotype counts.
 * @interface PhenotypeCount
 */
interface PhenotypeCount {
  [key: string]: { description: string; count: number };
}

/**
 * Processes a list of URLs to fetch and analyze patient data.
 * @async
 * @param {string[]} urls - Array of URLs to process
 * @returns {Promise<PhenotypeCount>} Object containing phenotype counts
 */
async function processUrls(urls: string[]): Promise<PhenotypeCount> {
  const phenotypeCounts: PhenotypeCount = {};

  for (const url of urls) {
    try {
      // Fetch patient data from the URL
      const patientData = await dataService.fetchPatientData(url);

      // Convert binary data to Buffer and unzip
      const zipBuffer = Buffer.from(patientData, 'binary');
      const zip = await unzipper.Open.buffer(zipBuffer);

      // Process each file in the zip
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

      // Process records and update phenotype counts
      for (const records of allRecords) {
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

/**
 * Main function to run the worker.
 * Processes the URLs passed in workerData and sends the result back to the parent thread.
 * @async
 */
async function runWorker() {
  const { urls } = workerData as WorkerData;
  const result = await processUrls(urls);
  parentPort?.postMessage(result);
}

// Start the worker
runWorker();
