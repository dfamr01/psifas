import { Worker } from 'worker_threads';
import path from 'path';
import dataService from './dataService';
import { CONCURRENCY } from '../config';

interface PhenotypeCount {
  [key: string]: { description: string; count: number };
}

interface PhenotypeCountMerge {
  [key: string]: { descriptions: Set<string>; count: number };
}

interface Statistics {
  [key: string]: number;
}

class AnalysisService {
  private async getPatientDataUrls(): Promise<string[]> {
    const urls: string[] = [];
    let offset = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        const address = await dataService.getPatientDataAddresses(offset);
        if (!address?.url) {
          hasMore = false;
        } else {
          urls.push(address.url);
          offset = address.offset;
        }
      }
    } catch (error) {
      console.error('Error in getPatientDataUrls', (error as Error).message);
    }

    return urls;
  }

  private createWorker(urls: string[]): Promise<PhenotypeCount> {
    const workerPath = path.resolve(__dirname, '../workers/analysisWorker.ts');
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, {
        workerData: { urls },
        execArgv: ['--require', 'ts-node/register', '--require', 'tsconfig-paths/register'],
      });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  private mergeCounts(countArrays: PhenotypeCount[]): PhenotypeCountMerge {
    return countArrays.reduce((acc, counts) => {
      for (const [key, value] of Object.entries(counts)) {
        if (!acc[key]) {
          acc[key] = { descriptions: new Set([value.description]), count: value.count };
        } else {
          acc[key].descriptions.add(value.description);
          acc[key].count += value.count;
        }
      }
      return acc;
    }, {} as PhenotypeCountMerge);
  }

  private getStatistics(mergedCounts: PhenotypeCountMerge): Statistics {
    const statistics = {} as Statistics;
    for (const value of Object.values(mergedCounts)) {
      const descriptions = Array.from(value.descriptions).join(', ');
      statistics[descriptions] = value.count;
    }
    return statistics;
  }

  async analyze(): Promise<Statistics> {
    const urls = await this.getPatientDataUrls();
    const chunkSize = Math.ceil(urls.length / +CONCURRENCY);
    let urlChunks = Array.from({ length: +CONCURRENCY }, (_, i) => urls.slice(i * chunkSize, (i + 1) * chunkSize));
    urlChunks = urlChunks.filter(chunk => chunk.length > 0);
    const workerPromises = urlChunks.map(chunk => this.createWorker(chunk));
    const results = await Promise.all(workerPromises);
    const mergedCounts = this.mergeCounts(results);
    const statistics = this.getStatistics(mergedCounts);

    await dataService.sendStatistics(statistics);
    console.log('AnalysisService ~ analyze ~ statistics:', statistics);

    return statistics;
  }
}

export default new AnalysisService();
