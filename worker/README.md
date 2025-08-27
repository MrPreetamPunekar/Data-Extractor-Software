<<<<<<< HEAD
# Data Extractor Worker

This is the worker service for the AI-Powered Business Data Extractor application. It handles web scraping, data extraction, processing, and normalization tasks using Playwright, Cheerio, and AI-powered entity recognition.

## Features

- Web scraping with Playwright and Cheerio
- AI-powered entity extraction for business names, emails, phone numbers, addresses, and websites
- Data processing and normalization
- Duplicate detection and removal
- Proxy server support for rotating IP addresses
- Robots.txt compliance checking
- Captcha detection
- Progress tracking and monitoring

## Technologies Used

- Node.js
- Playwright for browser automation
- Cheerio for HTML parsing
- PostgreSQL with Sequelize ORM
- Bull for job queue management
- libphonenumber-js for phone number parsing
- validator for data validation
- Winston for logging

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd worker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values.

## Project Structure

```
worker/
├── src/
│   ├── ai/              # AI-powered entity extraction
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── processors/      # Data processing and normalization
│   ├── scrapers/        # Web scraping functionality
│   └── worker.js        # Main worker entry point
├── tests/               # Unit and integration tests
├── package.json         # Project dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development

To start the worker in development mode:
```bash
npm run dev
```

To run tests:
```bash
npm test
```

## Worker Functionality

The worker service performs the following tasks:

1. **Job Processing**: Listens for scraping jobs from the Redis queue
2. **Web Scraping**: Uses Playwright to scrape web pages or Cheerio for simpler HTML parsing
3. **Entity Extraction**: Applies AI-powered extraction to identify business information
4. **Data Processing**: Normalizes and validates extracted data
5. **Duplicate Detection**: Identifies and marks duplicate records
6. **Data Storage**: Saves processed records to the database

## Proxy Support

The worker can use proxy servers to rotate IP addresses and avoid being blocked by websites. Proxy servers are managed through the `proxy_servers` database table.

## Error Handling

The worker includes comprehensive error handling:
- Graceful shutdown on SIGINT
- Detailed logging with Winston
- Retry mechanisms for failed jobs
- Captcha detection and reporting

## Security

The worker implements several security measures:
- Robots.txt compliance checking
- User agent rotation
- Proxy server support
- Captcha detection
- Rate limiting through job queue

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

=======
# Data Extractor Worker

This is the worker service for the AI-Powered Business Data Extractor application. It handles web scraping, data extraction, processing, and normalization tasks using Playwright, Cheerio, and AI-powered entity recognition.

## Features

- Web scraping with Playwright and Cheerio
- AI-powered entity extraction for business names, emails, phone numbers, addresses, and websites
- Data processing and normalization
- Duplicate detection and removal
- Proxy server support for rotating IP addresses
- Robots.txt compliance checking
- Captcha detection
- Progress tracking and monitoring

## Technologies Used

- Node.js
- Playwright for browser automation
- Cheerio for HTML parsing
- PostgreSQL with Sequelize ORM
- Bull for job queue management
- libphonenumber-js for phone number parsing
- validator for data validation
- Winston for logging

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd worker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values.

## Project Structure

```
worker/
├── src/
│   ├── ai/              # AI-powered entity extraction
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── processors/      # Data processing and normalization
│   ├── scrapers/        # Web scraping functionality
│   └── worker.js        # Main worker entry point
├── tests/               # Unit and integration tests
├── package.json         # Project dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development

To start the worker in development mode:
```bash
npm run dev
```

To run tests:
```bash
npm test
```

## Worker Functionality

The worker service performs the following tasks:

1. **Job Processing**: Listens for scraping jobs from the Redis queue
2. **Web Scraping**: Uses Playwright to scrape web pages or Cheerio for simpler HTML parsing
3. **Entity Extraction**: Applies AI-powered extraction to identify business information
4. **Data Processing**: Normalizes and validates extracted data
5. **Duplicate Detection**: Identifies and marks duplicate records
6. **Data Storage**: Saves processed records to the database

## Proxy Support

The worker can use proxy servers to rotate IP addresses and avoid being blocked by websites. Proxy servers are managed through the `proxy_servers` database table.

## Error Handling

The worker includes comprehensive error handling:
- Graceful shutdown on SIGINT
- Detailed logging with Winston
- Retry mechanisms for failed jobs
- Captcha detection and reporting

## Security

The worker implements several security measures:
- Robots.txt compliance checking
- User agent rotation
- Proxy server support
- Captcha detection
- Rate limiting through job queue

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

>>>>>>> e5d4683 (Initial commit)
This project is licensed under the MIT License.