import analysisService from './services/analysisService';

async function main() {
  console.log('Starting Psifas data analysis...');

  try {
    const results = await analysisService.analyze();
    console.log('Analysis completed. Results:', results);
  } catch (error) {
    console.error('An error occurred during analysis:', (error as Error).message);
  }
}

main();
