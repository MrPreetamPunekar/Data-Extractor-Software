# Data Extractor Backend

This is the backend API for the AI-Powered Business Data Extractor application. It provides RESTful endpoints for user authentication, job management, data extraction, and export functionality.

## Features

- User authentication with JWT
- Job management (create, update, delete, start, cancel)
- Data extraction from multiple sources
- AI-powered entity recognition
- Data processing and normalization
- Export to CSV and Excel formats
- Progress tracking and monitoring

## Technologies Used

- Node.js
- Express.js
- PostgreSQL with Sequelize ORM
- JWT for authentication
- bcryptjs for password hashing
- Bull for job queue management
- Playwright for web scraping
- Cheerio for HTML parsing
- ExcelJS for Excel export
- Winston for logging

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
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

5. Run database migrations:
   ```bash
   # This would typically be done with a migration tool
   # For now, you can run the SQL files in the migrations directory
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs` - Get all jobs for user
- `GET /api/jobs/:id` - Get a specific job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job
- `POST /api/jobs/:id/start` - Start a job
- `POST /api/jobs/:id/cancel` - Cancel a job
- `GET /api/jobs/:id/results` - Get job results
- `GET /api/jobs/:id/progress` - Get job progress

### Exports
- `POST /api/exports` - Create a new export
- `GET /api/exports` - Get all exports for user
- `GET /api/exports/:id` - Get a specific export
- `GET /api/exports/:id/download` - Download an export

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── config/          # Configuration files
│   └── app.js          # Express app entry point
├── migrations/          # Database migration files
├── tests/               # Unit and integration tests
├── package.json         # Project dependencies
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Development

To start the development server:
```bash
npm run dev
```

To run tests:
```bash
npm test
```

To run tests with coverage:
```bash
npm run test:coverage
```

## Environment Variables

See `.env.example` for all required environment variables.

## Logging

The application uses Winston for logging. Logs are written to:
- `logs/error.log` for error logs
- `logs/combined.log` for all logs

## Error Handling

The application uses a centralized error handling middleware that:
- Logs errors with Winston
- Converts known errors to user-friendly messages
- Handles Mongoose, JWT, and validation errors
- Provides stack traces in development mode

## Security

The application implements several security measures:
- Helmet for HTTP headers
- CORS for cross-origin requests
- Rate limiting to prevent abuse
- Input validation and sanitization
- Password hashing with bcrypt
- JWT authentication
- SQL injection prevention through Sequelize

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.