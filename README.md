# Psifas Data Analysis Service

This service efficiently pulls and analyzes medical records from a server, creating statistical information about phenotype occurrences.

## Prerequisites

- Node.js (v14 or later)
- npm (usually comes with Node.js)

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/dfamr01/psifas
   cd psifas-data-analysis
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   EMAIL=your.email@example.com
   # Add any other necessary environment variables
   ```

## Running the Application

To run the application in development mode:

```
npm run dev
```

This command will start the application using `nodemon`, which will watch for file changes and automatically restart the server.

## Project Structure

```
psifas-data-analysis/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── services/
│   │   ├── dataService.ts
│   │   ├── analysisService.ts
│   │   └── tokenService.ts
│   ├── utils/
│   │   └── httpClient.ts
│   └── workers/
│       └── analysisWorker.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- Fetches medical records from multiple URLs
- Processes ZIP files containing CSV data
- Analyzes phenotype occurrences
- Uses worker threads for parallel processing
- Sends statistical results back to the server

## Scripts

- `npm run dev`: Runs the application in development mode
- `npm run build`: Compiles TypeScript to JavaScript
- `npm start`: Runs the compiled JavaScript (for production)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.