# Data Extractor Web App - Technical Architecture

## 1. Tech Stack Recommendation

For the Data Extractor web app, we'll use a modern, scalable, and open-source stack that meets all requirements while minimizing costs:

### Backend
- **Node.js with Express.js**: Fast, non-blocking I/O ideal for scraping tasks, large ecosystem, and easy integration with Playwright
- **MongoDB**: Flexible document database perfect for storing varied contact data with different fields, good performance for read-heavy operations
- **Redis**: For job queue management, caching, and session storage
- **Bull Queue**: Robust queue system built on Redis for managing scraping jobs

### Frontend
- **React.js**: Component-based library with excellent ecosystem for building responsive UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Chart.js**: For data visualization of extraction statistics

### Scraping & Data Processing
- **Playwright**: Modern browser automation library with excellent performance and reliability
- **Cheerio**: Server-side jQuery for fast HTML manipulation when headless browsing isn't needed
- **Transformers.js (Hugging Face)**: Client-side AI models for Named Entity Recognition without external API costs

### Data Export & Processing
- **ExcelJS**: Pure JavaScript library for creating and manipulating Excel files
- **PapaParse**: For CSV parsing and generation
- **Validator.js**: For data validation and sanitization

### Authentication & Security
- **JWT**: For stateless authentication
- **Bcrypt.js**: For password hashing
- **Helmet**: For securing Express apps with various HTTP headers
- **Rate-limiter-flexible**: For API rate limiting

### Infrastructure & DevOps
- **Docker**: Containerization for consistent deployment across environments
- **Docker Compose**: For orchestrating multi-container applications
- **GitHub Actions**: For CI/CD pipeline
- **PM2**: Process manager for Node.js applications in production

### Development & Testing
- **Jest**: Testing framework for unit and integration tests
- **Supertest**: For API endpoint testing
- **ESLint & Prettier**: For code quality and formatting
- **Nodemon**: For development server auto-restart

This stack provides:
- Full support for headless browser scraping and HTTP requests
- Scalable architecture with queue-based job processing
- Client-side AI inference without external API costs
## Conclusion

The Data Extractor web app architecture presented in this document provides a comprehensive solution for extracting business contact information from multiple sources while maintaining ethical standards and legal compliance. The system is designed with modularity, scalability, and security in mind, ensuring it can adapt to changing requirements and data sources.

Key architectural decisions that support these goals include:

1. **Modular Design**: The use of separate workers for scraping, AI extraction, and data processing allows for independent scaling and maintenance of different components.

2. **Ethical Data Extraction**: The architecture includes mechanisms for respecting robots.txt, terms of service, and user consent for flagged sources, ensuring responsible data collection.

3. **Security and Compliance**: Built-in security measures and compliance checklists protect both user data and the rights of data sources.

4. **Scalability**: The queue-based architecture with Redis and Bull allows for horizontal scaling of worker processes to handle large volumes of extraction jobs.

5. **Data Quality**: The combination of AI-powered entity recognition and traditional regex extraction ensures high accuracy in data extraction, with confidence scoring for quality assessment.

6. **User Experience**: The API-first design with comprehensive endpoints and export options provides flexibility for various user needs and integration scenarios.

The phased development approach outlined in the MVP plan allows for rapid deployment of core functionality while gradually adding advanced features based on user feedback and requirements. This approach minimizes time-to-market while ensuring the system's robustness and reliability.

The technology stack chosen balances performance, cost, and ease of maintenance. By leveraging open-source tools like Node.js, MongoDB, Playwright, and Transformers.js, the system avoids vendor lock-in while maintaining access to cutting-edge capabilities.

This architecture provides a solid foundation for building a data extraction platform that not only meets current requirements but can also evolve to accommodate future needs and technological advances in web scraping and AI.
- Complete data export capabilities to Excel and CSV
- Robust security features including authentication and rate limiting
- Containerized deployment for easy scaling and maintenance
## 2. High-Level Architecture & Data Flow

The Data Extractor web app follows a modular, scalable architecture with clearly separated concerns. Here's the high-level architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   User Frontend │    │   Admin Frontend │    │  Mobile Frontend │
│   (React)       │    │   (React)        │    │   (React Native) │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬────────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      API Gateway        │
                    │      (Express.js)       │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐    ┌─────────▼─────────┐   ┌──────────▼──────────┐
│ Authentication │    │ Business Logic    │   │ Data Processing     │
│ Service        │    │ Layer             │   │ Services            │
│ (JWT, Bcrypt)  │    │ (Controllers)     │   │ (Queue Workers)     │
└───────┬────────┘    └─────────┬─────────┘   └──────────┬──────────┘
        │                       │                        │
┌───────▼────────┐    ┌─────────▼─────────┐   ┌──────────▼──────────┐
│   User Mgmt    │    │   Extraction      │   │   AI Processing     │
│   Service      │    │   Service         │   │   Service           │
│ (MongoDB)      │    │ (MongoDB)         │   │ (Transformers.js)   │
└────────────────┘    └─────────┬─────────┘   └─────────────────────┘
                                │
                   ┌────────────▼────────────┐
                   │    Queue Management     │
                   │      (Bull + Redis)     │
                   └────────────┬────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
    ┌─────────▼──────┐ ┌────────▼────────┐ ┌──────▼────────┐
    │ Web Scraping   │ │ HTTP API        │ │ File Upload   │
    │ Workers        │ │ Connectors      │ │ Processing    │
    │ (Playwright)   │ │                 │ │               │
    └────────────────┘ └─────────────────┘ └───────────────┘

Data Flow Process:

1. User submits extraction request via frontend
2. API Gateway validates and authenticates request
3. Request is queued in Redis via Bull Queue
4. Worker processes pick up jobs from queue
5. Scraping workers use Playwright to extract data from sources
6. HTTP API connectors fetch data from compliant APIs
7. File processing workers parse uploaded CSVs/documents
8. Raw data is processed through AI NER model for entity extraction
9. Data is normalized, validated, and deduplicated
10. Results are stored in MongoDB with metadata
11. User can preview, select, and export results via frontend
12. Export service generates Excel/CSV files on demand
```

### Key Architectural Components

1. **Frontend Layer**
   - User interface for search, preview, and export
   - Admin interface for monitoring and configuration
   - Real-time updates via WebSocket for job status

2. **API Gateway**
   - Central entry point for all client requests
   - Authentication and authorization
   - Rate limiting and request validation
   - Load balancing and request routing

3. **Business Logic Layer**
   - Controllers handling API requests
   - Service layer implementing business rules
   - Data validation and transformation

4. **Queue Management**
   - Bull Queue with Redis backend for job scheduling
   - Priority-based job processing
   - Retry mechanisms and failure handling
   - Scheduled extraction support

5. **Worker Services**
   - Web scraping workers using Playwright
   - HTTP API connector workers
   - File processing workers
   - Data processing and normalization workers
   - AI extraction workers

6. **Data Layer**
## 3. Database Schema Design

The database schema is designed to store both raw scraped data and normalized business contact information, along with metadata for tracking, validation, and enrichment.

### Collections

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String, // Unique
  password: String, // Hashed
  name: String,
  role: String, // 'user' | 'admin'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

#### 2. ExtractionJobs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  name: String, // User-defined job name
  status: String, // 'queued' | 'processing' | 'completed' | 'failed'
  sources: [String], // List of data sources
  searchQuery: String, // Search keywords
  location: String, // Geographic location for search
  scheduledAt: Date, // For scheduled extractions
  startedAt: Date,
  completedAt: Date,
  totalRecords: Number,
  processedRecords: Number,
  failedRecords: Number,
  config: {
    includeWebsiteMeta: Boolean,
    includeSocialLookup: Boolean,
    verifyEmails: Boolean,
    proxyEnabled: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. RawData Collection
```javascript
{
  _id: ObjectId,
  jobId: ObjectId, // Reference to ExtractionJobs
  sourceUrl: String, // Original URL where data was found
  sourceType: String, // 'web_scrape' | 'api' | 'file_upload'
  rawData: Object, // Complete raw HTML/content
  extractedAt: Date,
  userAgent: String, // User agent used for scraping
  ipAddress: String, // IP used for request
  httpStatus: Number, // HTTP status code
  scrapeDuration: Number, // In milliseconds
  tosCompliant: Boolean, // Whether source TOS allows scraping
  requiresReview: Boolean, // Flag for manual review
  captchaRequired: Boolean // Whether captcha was encountered
}
```

#### 4. BusinessRecords Collection (Normalized Data)
```javascript
{
  _id: ObjectId,
  jobId: ObjectId, // Reference to ExtractionJobs
  rawDataId: ObjectId, // Reference to RawData
  businessName: String,
  businessNameConfidence: Number, // 0-1 score
  contactPerson: String,
  contactPersonConfidence: Number, // 0-1 score
  phoneNumber: String, // Normalized E.164 format
  phoneConfidence: Number, // 0-1 score
  email: String,
  emailConfidence: Number, // 0-1 score
  emailVerified: Boolean, // MX/SMTP check result
  websiteUrl: String,
  websiteTitle: String, // From meta title
  websiteDescription: String, // From meta description
  physicalAddress: String,
  addressConfidence: Number, // 0-1 score
  latitude: Number, // Geo-coordinates
  longitude: Number, // Geo-coordinates
  socialProfiles: {
    linkedin: String,
    facebook: String,
    twitter: String
  },
  sourceUrl: String, // URL where record was found
  sourceType: String, // 'web_scrape' | 'api' | 'file_upload'
  extractedAt: Date,
  confidenceScore: Number, // Overall confidence 0-1
  isDuplicate: Boolean, // Deduplication flag
  duplicateOf: ObjectId, // Reference to original record
  enrichmentData: Object, // Additional enriched information
  validationResults: {
    emailValid: Boolean,
    phoneValid: Boolean,
    addressValid: Boolean
  },
  tags: [String], // User-defined tags
  notes: String, // User notes
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Exports Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  jobId: ObjectId, // Reference to ExtractionJobs
  fileName: String,
  fileType: String, // 'csv' | 'xlsx'
  recordCount: Number,
  selectedRecords: [ObjectId], // References to BusinessRecords
  exportConfig: {
    columns: [String], // Selected columns for export
    includeMetadata: Boolean
  },
  downloadUrl: String, // Temporary download link
  expiresAt: Date, // Expiration time for download link
  createdAt: Date
}
```

#### 6. ProxyServers Collection
```javascript
{
  _id: ObjectId,
  host: String,
  port: Number,
  username: String,
  password: String,
  isActive: Boolean,
  lastUsed: Date,
  successCount: Number,
  failCount: Number,
  avgResponseTime: Number, // In milliseconds
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. AuditLogs Collection
```javascript
{
  _id: ObjectId,
## 4. Key API Endpoints

The Data Extractor API provides a comprehensive set of endpoints for managing users, extraction jobs, data records, and exports. All endpoints follow REST conventions and use JSON for request/response bodies.

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
```javascript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "5f8d0d5e6c9d4e0017f0f0f0",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token
```javascript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "5f8d0d5e6c9d4e0017f0f0f0",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/logout
Invalidate user session
```javascript
// Request (requires authentication)
// No body required

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Management Endpoints

#### GET /api/users/profile
Get authenticated user's profile
```javascript
// Request (requires authentication)

// Response
{
  "success": true,
  "data": {
    "userId": "5f8d0d5e6c9d4e0017f0f0f0",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastLogin": "2023-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/users/profile
Update user profile
```javascript
// Request (requires authentication)
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}

// Response
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "5f8d0d5e6c9d4e0017f0f0f0",
    "email": "johnsmith@example.com",
    "name": "John Smith",
    "role": "user"
  }
}
```

### Extraction Job Endpoints

#### POST /api/jobs
Create a new extraction job
```javascript
// Request (requires authentication)
{
  "name": "Restaurant leads in NYC",
  "searchQuery": "restaurants",
  "location": "New York, NY",
  "sources": ["google_maps", "yellow_pages", "yelp"],
  "config": {
    "includeWebsiteMeta": true,
    "includeSocialLookup": false,
    "verifyEmails": true,
    "proxyEnabled": true
  },
  "scheduledAt": "2023-01-20T09:00:00.000Z" // Optional for scheduled jobs
}

// Response
{
  "success": true,
  "message": "Extraction job created successfully",
  "data": {
    "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
    "name": "Restaurant leads in NYC",
    "status": "queued",
    "totalRecords": 0,
    "processedRecords": 0
  }
}
```

#### GET /api/jobs
List all extraction jobs for user
```javascript
// Request (requires authentication)
// Query parameters: page, limit, status

// Response
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
        "name": "Restaurant leads in NYC",
        "status": "completed",
        "sources": ["google_maps", "yellow_pages"],
        "searchQuery": "restaurants",
        "location": "New York, NY",
        "scheduledAt": null,
        "startedAt": "2023-01-15T10:00:00.000Z",
        "completedAt": "2023-01-15T10:15:00.000Z",
        "totalRecords": 127,
        "processedRecords": 127,
        "createdAt": "2023-01-15T09:55:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### GET /api/jobs/:jobId
Get details of a specific extraction job
```javascript
// Request (requires authentication)

// Response
{
  "success": true,
  "data": {
    "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
    "userId": "5f8d0d5e6c9d4e0017f0f0f0",
    "name": "Restaurant leads in NYC",
    "status": "completed",
    "sources": ["google_maps", "yellow_pages"],
    "searchQuery": "restaurants",
    "location": "New York, NY",
    "config": {
      "includeWebsiteMeta": true,
      "includeSocialLookup": false,
      "verifyEmails": true,
      "proxyEnabled": true
    },
    "scheduledAt": null,
    "startedAt": "2023-01-15T10:00:00.000Z",
    "completedAt": "2023-01-15T10:15:00.000Z",
    "totalRecords": 127,
    "processedRecords": 127,
    "failedRecords": 0,
    "createdAt": "2023-01-15T09:55:00.000Z",
    "updatedAt": "2023-01-15T10:15:00.000Z"
  }
}
```

#### DELETE /api/jobs/:jobId
Delete an extraction job and associated data
```javascript
// Request (requires authentication)

// Response
{
  "success": true,
  "message": "Extraction job deleted successfully"
}
```

### Business Records Endpoints

#### GET /api/records
List business records from a job
```javascript
// Request (requires authentication)
// Query parameters: jobId, page, limit, search, sortBy, sortOrder

// Response
{
  "success": true,
  "data": {
    "records": [
      {
        "recordId": "5f8d0d5e6c9d4e0017f0f0f2",
        "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
        "businessName": "Joe's Pizza",
        "contactPerson": "Joe Smith",
        "phoneNumber": "+12125551234",
        "email": "joe@joespizza.com",
        "websiteUrl": "https://joespizza.com",
        "physicalAddress": "123 Main St, New York, NY 10001",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "confidenceScore": 0.95,
        "isDuplicate": false,
        "createdAt": "2023-01-15T10:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 127,
      "pages": 13
    }
  }
}
```

#### GET /api/records/:recordId
Get details of a specific business record
```javascript
// Request (requires authentication)

// Response
{
  "success": true,
  "data": {
    "recordId": "5f8d0d5e6c9d4e0017f0f0f2",
    "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
    "rawDataId": "5f8d0d5e6c9d4e0017f0f0f3",
    "businessName": "Joe's Pizza",
    "businessNameConfidence": 0.98,
    "contactPerson": "Joe Smith",
    "contactPersonConfidence": 0.85,
    "phoneNumber": "+12125551234",
    "phoneConfidence": 0.95,
    "email": "joe@joespizza.com",
    "emailConfidence": 0.90,
    "emailVerified": true,
    "websiteUrl": "https://joespizza.com",
    "websiteTitle": "Joe's Pizza - Best Pizza in NYC",
    "websiteDescription": "Authentic New York style pizza since 1985",
    "physicalAddress": "123 Main St, New York, NY 10001",
    "addressConfidence": 0.92,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "socialProfiles": {
      "facebook": "https://facebook.com/joespizza"
    },
    "sourceUrl": "https://google.com/maps/place/Joe's+Pizza",
    "sourceType": "web_scrape",
    "extractedAt": "2023-01-15T10:05:00.000Z",
    "confidenceScore": 0.95,
    "isDuplicate": false,
    "validationResults": {
      "emailValid": true,
      "phoneValid": true,
      "addressValid": true
    },
    "createdAt": "2023-01-15T10:05:00.000Z",
    "updatedAt": "2023-01-15T10:05:30.000Z"
  }
}
```

#### PUT /api/records/:recordId
Update a business record
```javascript
// Request (requires authentication)
{
  "contactPerson": "Joseph Smith",
  "notes": "Called on Jan 16, interested in our services"
}

// Response
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "recordId": "5f8d0d5e6c9d4e0017f0f0f2",
    "contactPerson": "Joseph Smith",
    "notes": "Called on Jan 16, interested in our services"
  }
}
```

### Export Endpoints

#### POST /api/exports
Create a new export
```javascript
// Request (requires authentication)
{
  "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
  "fileType": "xlsx", // or "csv"
  "selectedRecords": ["5f8d0d5e6c9d4e0017f0f0f2", "5f8d0d5e6c9d4e0017f0f0f4"],
  "exportConfig": {
    "columns": ["businessName", "contactPerson", "phoneNumber", "email", "physicalAddress"],
    "includeMetadata": true
  }
}

// Response
{
  "success": true,
  "message": "Export created successfully",
  "data": {
    "exportId": "5f8d0d5e6c9d4e0017f0f0f5",
    "fileName": "restaurant-leads-2023-01-15.xlsx",
    "fileType": "xlsx",
    "recordCount": 2,
    "downloadUrl": "/api/exports/5f8d0d5e6c9d4e0017f0f0f5/download",
    "expiresAt": "2023-01-15T11:15:00.000Z"
  }
}
```

#### GET /api/exports
List exports for user
```javascript
// Request (requires authentication)
// Query parameters: page, limit, jobId

// Response
{
  "success": true,
  "data": {
    "exports": [
      {
        "exportId": "5f8d0d5e6c9d4e0017f0f0f5",
        "jobId": "5f8d0d5e6c9d4e0017f0f0f1",
        "fileName": "restaurant-leads-2023-01-15.xlsx",
        "fileType": "xlsx",
        "recordCount": 127,
        "createdAt": "2023-01-15T10:30:00.000Z",
        "expiresAt": "2023-01-15T11:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### GET /api/exports/:exportId/download
Download an export file
```javascript
// Request (requires authentication)

// Response
// Binary file download (Excel or CSV)
```

### Proxy Management Endpoints (Admin only)

#### GET /api/proxies
List proxy servers
```javascript
// Request (requires admin authentication)

// Response
{
  "success": true,
  "data": {
    "proxies": [
      {
        "proxyId": "5f8d0d5e6c9d4e0017f0f0f6",
        "host": "proxy1.example.com",
        "port": 8080,
        "isActive": true,
        "lastUsed": "2023-01-15T10:00:00.000Z",
        "successCount": 1250,
        "failCount": 50,
        "avgResponseTime": 1250
      }
    ]
  }
}
```

#### POST /api/proxies
Add a new proxy server
```javascript
// Request (requires admin authentication)
{
  "host": "proxy2.example.com",
  "port": 8080,
  "username": "proxyuser",
  "password": "proxypassword"
}

// Response
{
  "success": true,
  "message": "Proxy server added successfully",
  "data": {
    "proxyId": "5f8d0d5e6c9d4e0017f0f0f7"
  }
}
```

All API endpoints implement:
- JWT-based authentication
- Rate limiting (100 requests/minute per user)
- Input validation and sanitization
- Comprehensive error handling with meaningful messages
- Request logging for audit purposes
- CORS support for web frontend
  userId: ObjectId, // Reference to Users
  action: String, // 'scrape' | 'export' | 'login' | 'config_change'
  resourceId: ObjectId, // ID of affected resource
  resourceType: String, // 'job' | 'record' | 'export'
  details: Object, // Additional action details
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

### Indexes

To ensure optimal query performance, the following indexes should be created:

1. **Users Collection**
   - Unique index on `email`
   - Index on `isActive`

2. **ExtractionJobs Collection**
   - Index on `userId`
   - Index on `status`
   - Index on `scheduledAt`
   - Compound index on `userId` and `createdAt`

3. **RawData Collection**
   - Index on `jobId`
   - Index on `sourceUrl`
   - Index on `extractedAt`
   - Index on `requiresReview`

4. **BusinessRecords Collection**
   - Index on `jobId`
   - Index on `rawDataId`
   - Index on `email`
   - Index on `phoneNumber`
   - Index on `businessName`
   - Index on `isDuplicate`
   - Index on `confidenceScore`
   - Geospatial index on `latitude` and `longitude`
   - Compound index on `jobId` and `createdAt`

5. **Exports Collection**
   - Index on `userId`
   - Index on `jobId`
   - Index on `expiresAt`

This schema design supports all required features including data normalization, confidence scoring, deduplication, enrichment, and comprehensive metadata tracking.
   - MongoDB for storing extracted records and metadata
   - Redis for caching and queue management
   - File storage for exports and temporary data

7. **AI/ML Services**
   - Named Entity Recognition for contact information
   - Data validation and confidence scoring
   - Optional integration with external verification APIs

This architecture ensures scalability, maintainability, and separation of concerns while supporting all required features.
## 5. Scraper Worker Sample

Below is a sample implementation of a web scraping worker using Playwright, which is one of the core components of our data extraction system. This worker handles the extraction of business contact information from web directories while respecting robots.txt and terms of service.

### Playwright Scraper Worker

```javascript
// scraper-worker.js
const { chromium } = require('playwright');
const cheerio = require('cheerio');
const axios = require('axios');
const { parsePhoneNumber } = require('libphonenumber-js');
const validator = require('validator');

class WebScraperWorker {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      headless: config.headless !== false,
      userAgent: config.userAgent || 'DataExtractorBot/1.0',
      respectRobotsTxt: config.respectRobotsTxt !== false,
      ...config
    };
    this.browser = null;
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeUrl(url, selectors = {}) {
    if (!this.browser) {
      await this.initialize();
    }

    const context = await this.browser.newContext({
      userAgent: this.config.userAgent,
      viewport: { width: 1920, height: 1080 }
    });

    try {
      // Check robots.txt compliance if required
      if (this.config.respectRobotsTxt) {
        const isAllowed = await this.checkRobotsTxt(url);
        if (!isAllowed) {
          return {
            success: false,
            error: 'Blocked by robots.txt',
            requiresReview: true
          };
        }
      }

      const page = await context.newPage();
      
      // Set up request interception for tracking and blocking
      await page.route('**/*', route => {
        const type = route.request().resourceType();
        if (type === 'image' || type === 'font' || type === 'media') {
          route.abort();
        } else {
          route.continue();
        }
      });

      // Navigate to the page
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout
      });

      // Check if we encountered a captcha
      const captchaDetected = await this.detectCaptcha(page);
      if (captchaDetected) {
        return {
          success: false,
          error: 'Captcha detected',
          captchaRequired: true,
          requiresReview: true
        };
      }

      // Extract page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract business information using provided selectors
      const businessData = this.extractBusinessInfo($, selectors);

      // Extract website metadata
      const metadata = await this.extractMetadata(page);

      return {
        success: true,
        data: {
          ...businessData,
          ...metadata,
          sourceUrl: url,
          scrapedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresReview: true
      };
    } finally {
      await context.close();
    }
  }

  extractBusinessInfo($, selectors) {
    const info = {};

    // Extract business name
    if (selectors.businessName) {
      const nameElement = $(selectors.businessName);
      info.businessName = nameElement.text().trim();
    }

    // Extract contact person
    if (selectors.contactPerson) {
      const personElement = $(selectors.contactPerson);
      info.contactPerson = personElement.text().trim();
    }

    // Extract phone number
    if (selectors.phoneNumber) {
      const phoneElement = $(selectors.phoneNumber);
      const phoneText = phoneElement.text().trim();
      try {
        const phoneNumber = parsePhoneNumber(phoneText, 'US'); // Default to US, can be configurable
        if (phoneNumber.isValid()) {
          info.phoneNumber = phoneNumber.format('E.164');
        }
      } catch (e) {
        // If parsing fails, store raw value
        info.phoneNumber = phoneText;
      }
    }

    // Extract email
    if (selectors.email) {
      const emailElement = $(selectors.email);
      const emailText = emailElement.text().trim();
      if (validator.isEmail(emailText)) {
        info.email = emailText.toLowerCase();
      }
    }

    // Extract website URL
    if (selectors.websiteUrl) {
      const websiteElement = $(selectors.websiteUrl);
      const websiteUrl = websiteElement.attr('href') || websiteElement.text().trim();
      if (validator.isURL(websiteUrl)) {
        info.websiteUrl = websiteUrl;
      }
    }

    // Extract physical address
    if (selectors.physicalAddress) {
      const addressElement = $(selectors.physicalAddress);
      info.physicalAddress = addressElement.text().trim();
    }

    return info;
  }

  async extractMetadata(page) {
    try {
      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', el => el.content, '');
      
      return {
        websiteTitle: title,
        websiteDescription: description
      };
    } catch (error) {
      return {};
    }
  }

  async checkRobotsTxt(url) {
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      // Simple check - in a real implementation, you'd parse the robots.txt properly
      // This is a simplified version for demonstration
      return !response.data.includes('Disallow: /');
    } catch (error) {
      // If we can't fetch robots.txt, assume it's okay to proceed
      return true;
    }
  }

  async detectCaptcha(page) {
    // Check for common captcha indicators
    const captchaSelectors = [
      'iframe[src*="captcha"]',
      '[id*="captcha"]',
      '[class*="captcha"]',
      'img[alt*="captcha"]'
    ];

    for (const selector of captchaSelectors) {
      const element = await page.$(selector);
      if (element) {
        return true;
      }
    }

    return false;
  }

  // HTTP API connector alternative for sources that provide APIs
  async fetchFromApi(apiUrl, apiKey = null) {
    try {
      const headers = {
        'User-Agent': this.config.userAgent
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios.get(apiUrl, {
        headers,
        timeout: this.config.timeout
      });

      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status
      };
    }
  }
}

// Usage example
async function runScrapingJob(jobConfig) {
  const scraper = new WebScraperWorker({
    timeout: 30000,
    headless: true,
    respectRobotsTxt: true
  });

  try {
    // Example selectors for a business directory
    const selectors = {
      businessName: 'h1.business-name',
      contactPerson: '.contact-person',
      phoneNumber: '.phone-number',
      email: '.email-address',
      websiteUrl: '.website-link',
      physicalAddress: '.address'
    };

    const result = await scraper.scrapeUrl(jobConfig.url, selectors);
    
    if (result.success) {
      console.log('Scraping successful:', result.data);
      return result.data;
    } else {
      console.error('Scraping failed:', result.error);
      return { error: result.error, requiresReview: result.requiresReview };
    }
  } finally {
    await scraper.close();
  }
}

module.exports = WebScraperWorker;
```

### Queue Worker Implementation

```javascript
// queue-worker.js
const Bull = require('bull');
const WebScraperWorker = require('./scraper-worker');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/data-extractor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create a new queue for scraping jobs
const scrapingQueue = new Bull('scraping jobs', {
  redis: { port: 6379, host: '127.0.0.1' }
});

// Define job processing
scrapingQueue.process('scrape-business', async (job) => {
  const { url, jobId, selectors } = job.data;
  
  console.log(`Processing scrape job for: ${url}`);
  
  // Update job progress
  job.progress(10);
  
  // Initialize scraper
  const scraper = new WebScraperWorker({
    timeout: 30000,
    headless: true,
    respectRobotsTxt: true
  });
  
  try {
    // Update job progress
    job.progress(30);
    
    // Perform scraping
    const result = await scraper.scrapeUrl(url, selectors);
    
    // Update job progress
    job.progress(80);
    
    // Store result in database
    // (Implementation would depend on your data models)
    
    // Update job progress
    job.progress(100);
    
    return result;
  } catch (error) {
    throw new Error(`Scraping failed: ${error.message}`);
  } finally {
    await scraper.close();
  }
});

// Event listeners
scrapingQueue.on('completed', (job, result) => {
  console.log(`Job completed with result: ${JSON.stringify(result)}`);
});

scrapingQueue.on('failed', (job, err) => {
  console.log(`Job failed with error: ${err.message}`);
});

// Add a job to the queue
async function addScrapingJob(url, jobId, selectors) {
  const job = await scrapingQueue.add('scrape-business', {
    url,
    jobId,
    selectors
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
  
  return job;
## 6. Excel Export Sample

The data export functionality is a critical component of the Data Extractor web app, allowing users to download their extracted business contact information in both Excel (.xlsx) and CSV formats. Below is a sample implementation using ExcelJS for Excel file generation and built-in Node.js modules for CSV generation.

### Excel Export Implementation

```javascript
// excel-export.js
const ExcelJS = require('exceljs');
const fs = require('fs').promises;

class DataExporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  /**
   * Export business records to Excel format
   * @param {Array} records - Array of business record objects
   * @param {Object} config - Export configuration
   * @param {string} filePath - Path to save the file
   * @returns {Promise<string>} Path to the generated file
   */
  async exportToExcel(records, config, filePath) {
    // Create a new worksheet
    const worksheet = this.workbook.addWorksheet('Business Contacts');
    
    // Define columns based on config or use defaults
    const columns = this.defineColumns(config.columns || this.getDefaultColumns());
    worksheet.columns = columns;
    
    // Add data to worksheet
    records.forEach(record => {
      worksheet.addRow(this.formatRecordForExcel(record, config.includeMetadata));
    });
    
    // Apply styling
    this.applyStyling(worksheet);
    
    // Save workbook
    await this.workbook.xlsx.writeFile(filePath);
    return filePath;
  }
  
  /**
   * Export business records to CSV format
   * @param {Array} records - Array of business record objects
   * @param {Object} config - Export configuration
   * @param {string} filePath - Path to save the file
   * @returns {Promise<string>} Path to the generated file
   */
  async exportToCsv(records, config, filePath) {
    // Define headers
    const headers = config.columns || this.getDefaultColumns();
    const headerRow = headers.map(col => this.escapeCsvField(col.header)).join(',');
    
    // Create data rows
    const dataRows = records.map(record => {
      return headers.map(col => {
        const value = this.getNestedValue(record, col.key);
        return this.escapeCsvField(value);
      }).join(',');
    });
    
    // Combine headers and data
    const csvContent = [headerRow, ...dataRows].join('\n');
    
    // Write to file
    await fs.writeFile(filePath, csvContent, 'utf8');
    return filePath;
  }
  
  /**
   * Define column structure for Excel
   * @param {Array} columnKeys - Array of column keys to include
   * @returns {Array} Formatted column definitions
   */
  defineColumns(columnKeys) {
    const columnDefinitions = {
      businessName: { header: 'Business Name', key: 'businessName', width: 30 },
      contactPerson: { header: 'Contact Person', key: 'contactPerson', width: 25 },
      phoneNumber: { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      email: { header: 'Email', key: 'email', width: 30 },
      websiteUrl: { header: 'Website', key: 'websiteUrl', width: 35 },
      physicalAddress: { header: 'Address', key: 'physicalAddress', width: 40 },
      confidenceScore: { header: 'Confidence Score', key: 'confidenceScore', width: 15 },
      sourceUrl: { header: 'Source URL', key: 'sourceUrl', width: 50 },
      extractedAt: { header: 'Extracted At', key: 'extractedAt', width: 25 }
    };
    
    // Include only requested columns
    return columnKeys.map(key => columnDefinitions[key] || { header: key, key, width: 20 });
  }
  
  /**
   * Get default column keys
   * @returns {Array} Default column keys
   */
  getDefaultColumns() {
    return [
      'businessName',
      'contactPerson',
      'phoneNumber',
      'email',
      'websiteUrl',
      'physicalAddress',
      'confidenceScore',
      'sourceUrl',
      'extractedAt'
    ];
  }
  
  /**
   * Format a record for Excel export
   * @param {Object} record - Business record object
   * @param {boolean} includeMetadata - Whether to include metadata
   * @returns {Object} Formatted record
   */
  formatRecordForExcel(record, includeMetadata = false) {
    const formattedRecord = {
      businessName: record.businessName || '',
      contactPerson: record.contactPerson || '',
      phoneNumber: record.phoneNumber || '',
      email: record.email || '',
      websiteUrl: record.websiteUrl || '',
      physicalAddress: record.physicalAddress || '',
      confidenceScore: record.confidenceScore ? (record.confidenceScore * 100).toFixed(2) + '%' : '',
      sourceUrl: record.sourceUrl || '',
      extractedAt: record.extractedAt ? new Date(record.extractedAt).toLocaleString() : ''
    };
    
    if (includeMetadata) {
      formattedRecord.recordId = record.recordId || record._id || '';
      formattedRecord.jobId = record.jobId || '';
      formattedRecord.isDuplicate = record.isDuplicate ? 'Yes' : 'No';
      formattedRecord.emailVerified = record.emailVerified ? 'Yes' : 'No';
    }
    
    return formattedRecord;
  }
  
  /**
   * Apply styling to Excel worksheet
   * @param {Object} worksheet - ExcelJS worksheet object
   */
  applyStyling(worksheet) {
    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };
    
    // Add filters to the header row
    worksheet.autoFilter = 'A1:I1';
    
    // Freeze the header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    // Add alternating row colors
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
          };
        }
      }
    });
  }
  
  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Source object
   * @param {string} path - Dot notation path
   * @returns {any} Value at path or empty string
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }
  
  /**
   * Escape CSV field value
   * @param {any} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCsvField(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }
}

// Usage example
async function exportBusinessData(records, exportType, config) {
  const exporter = new DataExporter();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `business-contacts-${timestamp}.${exportType}`;
  const filePath = `./exports/${fileName}`;
  
  try {
    if (exportType === 'xlsx') {
      await exporter.exportToExcel(records, config, filePath);
    } else if (exportType === 'csv') {
      await exporter.exportToCsv(records, config, filePath);
    }
    
    console.log(`Export completed: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// Example usage with sample data
async function example() {
  const sampleRecords = [
    {
      recordId: '1',
      businessName: 'ABC Company',
      contactPerson: 'John Doe',
      phoneNumber: '+1-555-123-4567',
      email: 'john@abccompany.com',
      websiteUrl: 'https://abccompany.com',
      physicalAddress: '123 Main St, New York, NY 10001',
      confidenceScore: 0.95,
      sourceUrl: 'https://directory.example.com/abc-company',
      extractedAt: '2023-01-15T10:30:00Z',
      isDuplicate: false,
      emailVerified: true
    },
    {
      recordId: '2',
      businessName: 'XYZ Corporation',
      contactPerson: 'Jane Smith',
      phoneNumber: '+1-555-987-6543',
      email: 'jane@xyzcorp.com',
      websiteUrl: 'https://xyzcorp.com',
      physicalAddress: '456 Oak Ave, Los Angeles, CA 90210',
      confidenceScore: 0.87,
      sourceUrl: 'https://businesslist.example.com/xyz-corp',
      extractedAt: '2023-01-15T11:15:00Z',
      isDuplicate: false,
      emailVerified: false
    }
  ];
  
  const exportConfig = {
    columns: [
      'businessName',
      'contactPerson',
      'phoneNumber',
      'email',
      'websiteUrl',
      'physicalAddress',
      'confidenceScore'
    ],
    includeMetadata: true
  };
  
  // Export to Excel
  await exportBusinessData(sampleRecords, 'xlsx', exportConfig);
  
  // Export to CSV
  await exportBusinessData(sampleRecords, 'csv', exportConfig);
}

module.exports = DataExporter;
```

### API Endpoint for Exports

```javascript
// export-controller.js
const DataExporter = require('./excel-export');
const path = require('path');
const fs = require('fs').promises;

class ExportController {
  constructor() {
    this.exporter = new DataExporter();
  }
  
  /**
   * Create a new export job
   */
## 7. AI Extractor Example

The AI extractor component uses Named Entity Recognition (NER) to identify and extract business contact information from unstructured text sources. This implementation leverages the Transformers.js library to run machine learning models directly in the browser or Node.js environment without requiring external API calls.

### NER Model Implementation

```javascript
// ai-extractor.js
const { pipeline } = require('@xenova/transformers');

class AIExtractor {
  constructor() {
    this.model = null;
  }

  /**
   * Initialize the NER model
   */
  async initialize() {
    if (!this.model) {
      // Load the NER model (this will be cached after first load)
      this.model = await pipeline('ner', 'Xenova/bert-base-named-entity-recognition');
    }
  }

  /**
   * Extract entities from text using AI model
   * @param {string} text - Input text to extract entities from
   * @returns {Promise<Object>} Extracted entities
   */
  async extractEntities(text) {
    if (!this.model) {
      await this.initialize();
    }

    try {
      // Run the model on the input text
      const results = await this.model(text);
      
      // Process results to extract business contact information
      return this.processNERResults(results, text);
    } catch (error) {
      console.error('AI extraction failed:', error);
      throw error;
    }
  }

  /**
   * Process NER results to extract business contact information
   * @param {Array} results - NER model results
   * @param {string} text - Original text
   * @returns {Object} Extracted business contact information
   */
  processNERResults(results, text) {
    const extracted = {
      businessNames: [],
      contactPersons: [],
      phoneNumbers: [],
      emails: [],
      addresses: [],
      websites: [],
      confidence: {}
    };

    // Process each token prediction
    for (const result of results) {
      const { word, entity, score } = result;
      
      // Skip low confidence predictions
      if (score < 0.7) continue;
      
      switch (entity) {
        case 'ORG': // Organization
          extracted.businessNames.push({ value: word, confidence: score });
          break;
        case 'PERSON':
          extracted.contactPersons.push({ value: word, confidence: score });
          break;
        case 'MISC': // Could contain phone numbers, addresses, etc.
          // Further processing for phone numbers and addresses
          if (this.isPhoneNumber(word)) {
            extracted.phoneNumbers.push({ value: word, confidence: score });
          } else if (this.isAddressComponent(word)) {
            extracted.addresses.push({ value: word, confidence: score });
          }
          break;
        default:
          // Handle other entity types if needed
          break;
      }
    }

    return extracted;
  }

  /**
   * Check if a word is likely a phone number
   * @param {string} word - Word to check
   * @returns {boolean} True if word is likely a phone number
   */
  isPhoneNumber(word) {
    // Simple regex for phone number detection
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/;
    return phoneRegex.test(word);
  }

  /**
   * Check if a word is likely part of an address
   * @param {string} word - Word to check
   * @returns {boolean} True if word is likely part of an address
   */
  isAddressComponent(word) {
    // Simple check for address components
    const addressRegex = /\b(st|street|ave|avenue|blvd|boulevard|rd|road|ln|lane|dr|drive|ct|court|pl|place|sq|square|way|cir|circle|pkwy|parkway|ter|terrace|blv|bluff|bch|beach|cres|crest|cv|cove|expy|expressway|fwy|freeway|gln|glen|grn|garden|grove|hl|hill|is|island|jct|junction|ky|key|lndg|landing|lk|lake|mt|mount|mnt|mntn|mountain|pr|prairie|pt|point|rdg|ridge|rvr|river|shl|shore|sta|station|str|street|via|vis|vista|wl|well|creek|crk|crossing|crossroad|cr|court|ctr|center|plaza|plz|square|sq|terrace|ter|trail|trl|turnpike|tpke|parkway|pkwy|drive|dr|street|st|avenue|ave|road|rd|lane|ln|place|pl|circle|cir|boulevard|blvd|heights|hts|junction|jct|center|ctr|park|parkway|pkwy|drive|dr|street|st|avenue|ave|road|rd|lane|ln|place|pl|circle|cir|boulevard|blvd)\b/i;
    return addressRegex.test(word);
  }

  /**
   * Extract information from raw scraped content using both AI and regex
   * @param {string} rawContent - Raw scraped content
   * @returns {Promise<Object>} Extracted information
   */
  async extractFromRawContent(rawContent) {
    // Extract using AI model
    const aiResults = await this.extractEntities(rawContent);
    
    // Extract using regex as fallback
    const regexResults = this.extractWithRegex(rawContent);
    
    // Combine results with confidence scoring
    return this.combineResults(aiResults, regexResults);
  }

  /**
   * Extract information using regex patterns as fallback
   * @param {string} text - Text to extract from
   * @returns {Object} Extracted information from regex
   */
  extractWithRegex(text) {
    const results = {
      businessNames: [],
      contactPersons: [],
      phoneNumbers: [],
      emails: [],
      addresses: [],
      websites: []
    };

    // Email regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      results.emails = emails.map(email => ({ value: email, confidence: 0.9 }));
    }

    // Phone number regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
    const phones = text.match(phoneRegex);
    if (phones) {
      results.phoneNumbers = phones.map(phone => ({ value: phone, confidence: 0.85 }));
    }

    // Website regex
    const websiteRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const websites = text.match(websiteRegex);
    if (websites) {
      results.websites = websites.map(website => ({ value: website, confidence: 0.9 }));
    }

    // Address regex (simplified)
    const addressRegex = /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/g;
    const addresses = text.match(addressRegex);
    if (addresses) {
      results.addresses = addresses.map(address => ({ value: address, confidence: 0.8 }));
    }

    return results;
  }

  /**
   * Combine AI and regex results with confidence scoring
   * @param {Object} aiResults - Results from AI extraction
   * @param {Object} regexResults - Results from regex extraction
   * @returns {Object} Combined results
   */
  combineResults(aiResults, regexResults) {
    const combined = {
      businessNames: this.mergeResults(aiResults.businessNames, regexResults.businessNames),
      contactPersons: this.mergeResults(aiResults.contactPersons, regexResults.contactPersons),
      phoneNumbers: this.mergeResults(aiResults.phoneNumbers, regexResults.phoneNumbers),
      emails: this.mergeResults(aiResults.emails, regexResults.emails),
      addresses: this.mergeResults(aiResults.addresses, regexResults.addresses),
      websites: this.mergeResults(aiResults.websites, regexResults.websites),
      confidenceScore: 0
    };

    // Calculate overall confidence score
    const totalItems = Object.values(combined).flat().length;
    if (totalItems > 0) {
      // Weight AI results more heavily (70% weight) than regex (30% weight)
      const aiWeight = 0.7;
      const regexWeight = 0.3;
      
      let totalConfidence = 0;
      let itemCount = 0;
      
      // Calculate weighted average confidence
      for (const category in combined) {
        if (Array.isArray(combined[category])) {
          combined[category].forEach(item => {
            totalConfidence += item.confidence;
            itemCount++;
          });
        }
      }
      
      combined.confidenceScore = itemCount > 0 ? (totalConfidence / itemCount) : 0;
    }

    return combined;
  }

  /**
   * Merge two arrays of results, preferring higher confidence
   * @param {Array} aiArray - AI results
   * @param {Array} regexArray - Regex results
   * @returns {Array} Merged results
   */
  mergeResults(aiArray, regexArray) {
    const merged = [...aiArray];
    
    // Add regex results that don't conflict with AI results
    regexArray.forEach(regexItem => {
      const exists = aiArray.some(aiItem => aiItem.value === regexItem.value);
      if (!exists) {
        merged.push(regexItem);
      }
    });
    
    // Sort by confidence
    merged.sort((a, b) => b.confidence - a.confidence);
    
    return merged;
  }
}

// Usage example
async function extractBusinessInfo(rawContent) {
  const extractor = new AIExtractor();
  
  try {
    const results = await extractor.extractFromRawContent(rawContent);
    console.log('Extraction results:', results);
    return results;
  } catch (error) {
    console.error('Extraction failed:', error);
    throw error;
  }
}

// Example usage with sample content
async function example() {
  const sampleContent = `
    Contact Information:
    ABC Technology Solutions
    John Smith, CEO
    Phone: (555) 123-4567
    Email: john@abctech.com
    Website: https://abctech.com
    Address: 123 Tech Lane, San Francisco, CA 94103
    
    For support, contact Jane Doe at jane@abctech.com or call 555-987-6543.
    Our office hours are Monday-Friday, 9am-5pm PST.
    
    Follow us on social media:
    Facebook: https://facebook.com/abctech
    LinkedIn: https://linkedin.com/company/abctech
  `;
  
  const results = await extractBusinessInfo(sampleContent);
  console.log('Extracted business information:', JSON.stringify(results, null, 2));
}

module.exports = AIExtractor;
```

### AI Extraction Worker Implementation

```javascript
// ai-worker.js
const Bull = require('bull');
const AIExtractor = require('./ai-extractor');
const { normalizePhoneNumber } = require('./utils');

// Create a new queue for AI extraction jobs
const aiQueue = new Bull('ai extraction jobs', {
  redis: { port: 6379, host: '127.0.0.1' }
});

// Initialize AI extractor
## 8. Security, Legal & Operations Checklist

The Data Extractor web app must adhere to strict security, legal compliance, and operational best practices to ensure responsible data collection and processing. This checklist covers essential requirements across these three critical areas.

### Security Checklist

#### Authentication & Authorization
- [ ] Implement JWT-based authentication with secure token storage
- [ ] Use bcrypt.js for password hashing with appropriate salt rounds
- [ ] Implement role-based access control (RBAC) for admin functions
- [ ] Add multi-factor authentication (MFA) option for users
- [ ] Implement secure password reset functionality
- [ ] Enforce strong password policies
- [ ] Implement session management with automatic expiration

#### Data Protection
- [ ] Encrypt sensitive data at rest using AES-256
- [ ] Use HTTPS/TLS for all communications with modern cipher suites
- [ ] Implement field-level encryption for highly sensitive data
- [ ] Securely store API keys and secrets using environment variables
- [ ] Implement data masking for sensitive information in logs
- [ ] Regularly rotate encryption keys and API credentials
- [ ] Implement secure file upload and storage mechanisms

#### API Security
- [ ] Implement rate limiting (100 requests/minute per user)
- [ ] Add input validation and sanitization for all API endpoints
- [ ] Implement CORS policies to restrict frontend access
- [ ] Use helmet.js for securing Express apps with HTTP headers
- [ ] Implement request logging for audit trails
- [ ] Add DDoS protection measures
- [ ] Implement API versioning for backward compatibility

#### Network Security
- [ ] Use proxy servers for scraping to avoid IP blocking
- [ ] Implement proxy rotation to distribute requests
- [ ] Configure firewalls to restrict unnecessary access
- [ ] Use VPNs for accessing sensitive data sources when required
- [ ] Implement network segmentation for different service components
- [ ] Regularly update and patch all system components
- [ ] Conduct regular security audits and penetration testing

### Legal Compliance Checklist

#### Data Privacy & Protection
- [ ] Implement GDPR compliance measures for EU users
- [ ] Comply with CCPA requirements for California users
- [ ] Create clear privacy policy and terms of service
- [ ] Implement data retention and deletion policies
- [ ] Provide users with data export and deletion options
- [ ] Obtain explicit consent for data processing activities
- [ ] Implement data breach notification procedures

#### Web Scraping Ethics
- [ ] Respect robots.txt directives for all websites
- [ ] Comply with terms of service of data sources
- [ ] Implement rate limiting to avoid overloading servers
- [ ] Identify and flag sources that prohibit scraping
- [ ] Request user permission for sources requiring manual review
- [ ] Implement CAPTCHA resolution UI for blocked requests
- [ ] Log all scraping activities for audit purposes

#### Intellectual Property
- [ ] Respect copyright and trademark laws
- [ ] Avoid scraping and storing copyrighted content
- [ ] Implement proper attribution for data sources
- [ ] Comply with fair use guidelines for data usage
- [ ] Obtain proper licenses for commercial data sources
- [ ] Implement content filtering to exclude protected material
- [ ] Regularly review and update compliance measures

#### Industry Regulations
- [ ] Comply with CAN-SPAM Act for email-related activities
- [ ] Follow TCPA guidelines for phone number usage
- [ ] Implement CASL compliance for Canadian users
- [ ] Comply with local data protection laws in target markets
- [ ] Obtain necessary business licenses and permits
- [ ] Implement financial controls for payment processing
- [ ] Regularly review and update compliance policies

### Operational Best Practices

#### Infrastructure & Deployment
- [ ] Use containerization (Docker) for consistent deployment
- [ ] Implement CI/CD pipeline for automated testing and deployment
- [ ] Use environment-specific configuration files
- [ ] Implement monitoring and alerting for system health
- [ ] Set up automated backups for databases and critical data
- [ ] Implement disaster recovery procedures
- [ ] Use load balancing for high availability

#### Performance Optimization
- [ ] Implement caching for frequently accessed data
- [ ] Optimize database queries with proper indexing
- [ ] Use CDN for static assets
- [ ] Implement lazy loading for large datasets
- [ ] Optimize scraping schedules to avoid peak hours
- [ ] Monitor and optimize resource usage
- [ ] Implement pagination for large result sets

#### Maintenance & Support
- [ ] Implement logging for all system components
- [ ] Set up log aggregation and analysis tools
- [ ] Create runbooks for common operational tasks
- [ ] Implement automated testing for critical functions
- [ ] Regularly update dependencies and libraries
- [ ] Monitor system performance and user feedback
- [ ] Provide user documentation and support channels

#### Scalability & Reliability
- [ ] Design for horizontal scaling of worker processes
- [ ] Implement circuit breaker pattern for external services
- [ ] Use message queues for decoupling components
- [ ] Implement retry mechanisms with exponential backoff
- [ ] Design for fault tolerance and graceful degradation
- [ ] Monitor and optimize resource utilization
- [ ] Plan for capacity scaling based on user growth

### Source Compliance Matrix

| Data Source | Scraping Allowed | TOS Compliance | Requires Permission | CAPTCHA Risk | Notes |
|-------------|------------------|----------------|---------------------|--------------|-------|
| Google Maps | ❌ | No | Yes | High | Use official API instead |
| Yellow Pages | ⚠️ | Conditional | Yes | Medium | Check robots.txt |
| Yelp | ❌ | No | Yes | High | API available |
| LinkedIn | ❌ | No | Yes | High | Strict anti-scraping |
| Local Directories | ✅ | Yes | No | Low | Varies by site |
| Uploaded Files | ✅ | Yes | No | None | User-owned data |
| CSV Imports | ✅ | Yes | No | None | User-owned data |

### Manual Review Process

1. **Source Evaluation**
   - [ ] Check robots.txt compliance
   - [ ] Review terms of service
   - [ ] Assess CAPTCHA risk
   - [ ] Determine rate limits
   - [ ] Document findings in audit log

2. **User Permission Workflow**
   - [ ] Flag sources requiring permission
   - [ ] Notify user of compliance requirements
   - [ ] Obtain explicit user consent
   - [ ] Log user consent
   - [ ] Provide option to skip restricted sources

3. **CAPTCHA Resolution**
   - [ ] Detect CAPTCHA challenges
   - [ ] Pause automated scraping
   - [ ] Present CAPTCHA to user for resolution
## 9. Minimal Viable Product (MVP) Development Plan

The development of the Data Extractor web app will follow a phased approach, starting with a Minimal Viable Product (MVP) that delivers core functionality and gradually adding advanced features. This plan outlines the tasks, priorities, and timeline for development.

### MVP Scope

The MVP will include:
- User authentication and account management
- Basic web scraping functionality with Playwright
- Data extraction and storage in MongoDB
- Simple CSV export functionality
- Basic UI for managing extraction jobs

### Phase 1: Foundation (Weeks 1-2)

#### Tasks
1. Set up project repository and development environment
2. Implement user authentication system (JWT)
3. Create basic database schema in MongoDB
4. Set up Express.js server with basic routing
5. Implement simple web scraping with Playwright
6. Create basic data storage and retrieval
7. Develop simple UI with React
8. Implement basic CSV export functionality
9. Set up testing framework (Jest)
10. Create basic documentation

#### Priorities
1. Core infrastructure (authentication, database, server)
2. Basic scraping functionality
3. Data storage and retrieval
4. Simple UI for user interaction
5. Basic export functionality

### Phase 2: Core Features (Weeks 3-4)

#### Tasks
1. Implement multiple data source connectors
2. Add data validation and normalization
3. Implement queue management with Bull
4. Add scheduled extraction functionality
5. Enhance UI with job management features
6. Implement Excel export functionality
7. Add data deduplication features
8. Create admin interface
9. Implement rate limiting and security measures
10. Add comprehensive error handling

#### Priorities
1. Multiple data source support
2. Data validation and normalization
3. Job queue management
4. Scheduled extractions
5. Enhanced UI/UX
6. Excel export
7. Data deduplication
8. Security measures

### Phase 3: Advanced Features (Weeks 5-6)

#### Tasks
1. Implement AI-powered data extraction
2. Add data enrichment features
3. Create advanced filtering and search
4. Implement proxy rotation and management
5. Add CAPTCHA resolution UI
6. Implement source compliance checking
7. Add advanced analytics and reporting
8. Create mobile-responsive UI
9. Implement API rate limiting
10. Add comprehensive logging and monitoring

#### Priorities
1. AI-powered extraction
2. Data enrichment
3. Advanced filtering/search
4. Proxy management
5. CAPTCHA resolution
6. Source compliance
7. Analytics and reporting
8. Mobile responsiveness
9. Rate limiting
10. Logging and monitoring

### Phase 4: Polish and Release (Weeks 7-8)

#### Tasks
1. Conduct comprehensive testing
2. Optimize performance
3. Create user documentation
4. Implement onboarding flow
5. Add tooltips and help text
6. Conduct security audit
7. Prepare deployment scripts
8. Create marketing materials
9. Set up customer support system
10. Finalize release

#### Priorities
1. Comprehensive testing
2. Performance optimization
3. User documentation
4. Onboarding flow
5. Help system
6. Security audit
7. Deployment preparation
8. Marketing materials
9. Support system
10. Final release

### Detailed Task Breakdown

#### Authentication & User Management
- [ ] Implement user registration with email verification
- [ ] Create login/logout functionality with JWT
- [ ] Implement password reset functionality
- [ ] Add user roles and permissions (user, admin)
- [ ] Create user profile management
- [ ] Implement session management

#### Web Scraping Infrastructure
- [ ] Set up Playwright with basic configuration
- [ ] Implement browser management and optimization
- [ ] Create scraping job scheduler
- [ ] Add proxy support and rotation
- [ ] Implement robots.txt compliance checking
- [ ] Add CAPTCHA detection and resolution workflow
- [ ] Create source compliance matrix

#### Data Processing & Storage
- [ ] Design MongoDB schema for raw and processed data
- [ ] Implement data normalization and validation
- [ ] Add data deduplication functionality
- [ ] Create data enrichment workflows
- [ ] Implement confidence scoring for extracted data
- [ ] Add data retention and deletion policies

#### AI Extraction
- [ ] Integrate Transformers.js library
- [ ] Implement Named Entity Recognition models
- [ ] Create fallback regex extraction
- [ ] Develop confidence scoring for AI results
- [ ] Add data validation and normalization
- [ ] Implement queue processing for AI jobs

#### Export Functionality
- [ ] Implement CSV export with configurable columns
- [ ] Create Excel export with styling and formatting
- [ ] Add export job management
- [ ] Implement export file storage and retrieval
- [ ] Add export expiration and cleanup
- [ ] Create export preview functionality

#### UI/UX Implementation
- [ ] Design and implement dashboard
- [ ] Create job management interface
- [ ] Implement data preview and selection
- [ ] Add export configuration UI
- [ ] Create admin interface
- [ ] Implement responsive design for mobile

#### Security & Compliance
- [ ] Implement authentication and authorization
- [ ] Add rate limiting and throttling
- [ ] Create security audit logging
- [ ] Implement data encryption for sensitive information
- [ ] Add compliance checking for data sources
- [ ] Create manual review workflow for flagged sources

#### Testing & Quality Assurance
- [ ] Implement unit tests for all modules
- [ ] Create integration tests for workflows
- [ ] Add end-to-end tests for UI
- [ ] Implement performance testing
- [ ] Conduct security testing
- [ ] Create automated testing pipeline

#### Deployment & Operations
- [ ] Create Docker configuration
- [ ] Implement CI/CD pipeline
- [ ] Set up monitoring and alerting
- [ ] Create backup and disaster recovery procedures
- [ ] Implement logging and analytics
- [ ] Prepare production deployment

### Resource Allocation

#### Development Team
- **Lead Developer**: Overall architecture, code reviews, technical decisions
- **Frontend Developer**: UI/UX implementation, React components
- **Backend Developer**: API development, database design, scraping logic
- **AI Specialist**: AI extraction models, data processing algorithms
- **DevOps Engineer**: CI/CD, deployment, monitoring
- **QA Engineer**: Testing, quality assurance

#### Timeline
- **Total Duration**: 8 weeks
- **Core Team**: 4 developers, 1 QA engineer, 1 DevOps engineer
- **Part-time Resources**: Legal advisor (1 day/week), UX consultant (2 days/week)

### Success Metrics

#### Technical Metrics
- 95% uptime for scraping services
- < 2 second response time for API calls
- < 1% error rate in data extraction
- 90% accuracy in AI-powered entity recognition
- < 500ms latency for database queries

#### Business Metrics
- 100+ businesses extracted per job
- < 5% duplicate records
- 90% user satisfaction rating
- < 24 hour processing time for jobs
- 95% successful export generation

#### Compliance Metrics
- 100% adherence to robots.txt directives
- 0 violations of terms of service
- 100% GDPR/CCPA compliance
- 0 security incidents
- 100% audit trail for all scraping activities

### Risk Management

#### Technical Risks
- Rate limiting and IP blocking by data sources
- CAPTCHA challenges preventing automated scraping
- Changes in website structures breaking scrapers
- Performance issues with large datasets
- AI model accuracy below acceptable thresholds

#### Mitigation Strategies
- Implement proxy rotation and user agent rotation
- Create CAPTCHA resolution UI for user intervention
- Develop adaptive scraping with multiple parsing strategies
- Implement pagination and data streaming
- Use ensemble models and fallback mechanisms

#### Legal Risks
- Violation of terms of service
- Copyright infringement claims
- Data privacy regulation violations
- Misrepresentation of automated activity

#### Mitigation Strategies
- Regular legal review of scraping practices
- Implement strict compliance checking
- Obtain proper user consent for data sources
- Maintain detailed audit logs
- Provide clear disclosure of automated activity

This development plan provides a structured approach to building the Data Extractor web app, ensuring that all critical components are addressed while maintaining focus on delivering value to users as early as possible.
   - [ ] Resume scraping after resolution
   - [ ] Log CAPTCHA events

This comprehensive checklist ensures that the Data Extractor web app operates securely, legally, and efficiently while maintaining the trust of users and compliance with relevant regulations.
const aiExtractor = new AIExtractor();

// Define job processing
aiQueue.process('extract-entities', async (job) => {
  const { rawDataId, rawContent } = job.data;
  
  console.log(`Processing AI extraction job for raw data: ${rawDataId}`);
  
  // Update job progress
  job.progress(10);
  
  try {
    // Update job progress
    job.progress(30);
    
    // Perform AI extraction
    const results = await aiExtractor.extractFromRawContent(rawContent);
    
    // Update job progress
    job.progress(80);
    
    // Normalize and validate extracted data
    const normalizedResults = await normalizeAndValidate(results);
    
    // Store result in database
    // (Implementation would depend on your data models)
    
    // Update job progress
    job.progress(100);
    
    return normalizedResults;
  } catch (error) {
    throw new Error(`AI extraction failed: ${error.message}`);
  }
});

/**
 * Normalize and validate extracted data
 * @param {Object} results - AI extraction results
 * @returns {Object} Normalized and validated results
 */
async function normalizeAndValidate(results) {
  const normalized = { ...results };
  
  // Normalize phone numbers
  if (normalized.phoneNumbers) {
    normalized.phoneNumbers = normalized.phoneNumbers.map(item => {
      try {
        return {
          ...item,
          value: normalizePhoneNumber(item.value)
        };
      } catch (e) {
        // If normalization fails, keep original value
        return item;
      }
    });
  }
  
  // Validate emails
  if (normalized.emails) {
    normalized.emails = normalized.emails.filter(item => {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(item.value);
    });
  }
  
  // Validate websites
  if (normalized.websites) {
    normalized.websites = normalized.websites.filter(item => {
      // Simple URL validation
      const urlRegex = /^https?:\/\/.+/;
      return urlRegex.test(item.value);
    });
  }
  
  return normalized;
}

// Event listeners
aiQueue.on('completed', (job, result) => {
  console.log(`AI extraction job completed with result: ${JSON.stringify(result)}`);
});

aiQueue.on('failed', (job, err) => {
  console.log(`AI extraction job failed with error: ${err.message}`);
});

// Add a job to the queue
async function addAIExtractionJob(rawDataId, rawContent) {
  const job = await aiQueue.add('extract-entities', {
    rawDataId,
    rawContent
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
  
  return job;
}

module.exports = { addAIExtractionJob };
```

This AI extractor example demonstrates:

1. **Transformers.js Integration**: Uses the Transformers.js library for client-side NER without external API calls
2. **Named Entity Recognition**: Identifies business names, contact persons, and other entities
3. **Fallback Regex Extraction**: Combines AI results with traditional regex for comprehensive extraction
4. **Confidence Scoring**: Provides confidence scores for extracted entities
5. **Data Normalization**: Normalizes phone numbers to E.164 format
6. **Validation**: Validates extracted emails and website URLs
7. **Queue Integration**: Shows how to integrate with Bull Queue for job management
8. **Error Handling**: Comprehensive error handling with appropriate status reporting
9. **Modular Design**: Separates concerns into reusable components
10. **Extensibility**: Easy to add new entity types and extraction methods

The implementation balances accuracy with performance by using AI for complex extraction tasks while falling back to regex for well-defined patterns.
  async createExport(req, res) {
    try {
      const { jobId, fileType, selectedRecords, exportConfig } = req.body;
      const userId = req.user.id; // From authentication middleware
      
      // Validate input
      if (!jobId || !fileType || !['xlsx', 'csv'].includes(fileType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid export parameters'
        });
      }
      
      // Fetch records from database
      // In a real implementation, you would query your database here
      const records = await this.fetchRecords(jobId, selectedRecords);
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `export-${jobId}-${timestamp}.${fileType}`;
      const filePath = path.join(__dirname, '../exports', fileName);
      
      // Ensure exports directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      // Perform export
      let exportPath;
      if (fileType === 'xlsx') {
        exportPath = await this.exporter.exportToExcel(records, exportConfig, filePath);
      } else {
        exportPath = await this.exporter.exportToCsv(records, exportConfig, filePath);
      }
      
      // Save export record to database
      const exportRecord = await this.saveExportRecord({
        userId,
        jobId,
        fileName,
        fileType,
        recordCount: records.length,
        exportConfig,
        filePath: exportPath
      });
      
      // Generate temporary download URL (in a real app, you'd use signed URLs)
      const downloadUrl = `/api/exports/${exportRecord.id}/download`;
      
      res.status(201).json({
        success: true,
        message: 'Export created successfully',
        data: {
          exportId: exportRecord.id,
          fileName,
          fileType,
          recordCount: records.length,
          downloadUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    } catch (error) {
      console.error('Export creation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export creation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Download an export file
   */
  async downloadExport(req, res) {
    try {
      const { exportId } = req.params;
      const userId = req.user.id;
      
      // Fetch export record from database
      const exportRecord = await this.getExportRecord(exportId, userId);
      
      if (!exportRecord) {
        return res.status(404).json({
          success: false,
          message: 'Export not found'
        });
      }
      
      // Check if file exists
      if (!await this.fileExists(exportRecord.filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }
      
      // Check expiration
      if (new Date() > new Date(exportRecord.expiresAt)) {
        return res.status(410).json({
          success: false,
          message: 'Export file has expired'
        });
      }
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`);
      res.setHeader('Content-Type', exportRecord.fileType === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv');
      
      // Stream file to response
      const fileStream = fs.createReadStream(exportRecord.filePath);
      fileStream.pipe(res);
      
      // Update download count
      await this.updateDownloadCount(exportId);
    } catch (error) {
      console.error('Export download failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export download failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Helper methods (implementations would depend on your database)
  async fetchRecords(jobId, selectedRecords) {
    // In a real implementation, you would query your database here
    // For this example, we'll return mock data
    return [
      {
        recordId: '1',
        businessName: 'ABC Company',
        contactPerson: 'John Doe',
        phoneNumber: '+1-555-123-4567',
        email: 'john@abccompany.com',
        websiteUrl: 'https://abccompany.com',
        physicalAddress: '123 Main St, New York, NY 10001',
        confidenceScore: 0.95,
        sourceUrl: 'https://directory.example.com/abc-company',
        extractedAt: '2023-01-15T10:30:00Z'
      }
    ];
  }
  
  async saveExportRecord(exportData) {
    // In a real implementation, you would save to your database here
    return {
      id: 'export-123',
      ...exportData,
      createdAt: new Date().toISOString(),
      downloadCount: 0
    };
  }
  
  async getExportRecord(exportId, userId) {
    // In a real implementation, you would query your database here
    return {
      id: exportId,
      userId,
      fileName: 'export.xlsx',
      fileType: 'xlsx',
      filePath: './exports/export.xlsx',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      downloadCount: 0
    };
  }
  
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async updateDownloadCount(exportId) {
    // In a real implementation, you would update your database here
    console.log(`Download count updated for export ${exportId}`);
  }
}

module.exports = ExportController;
```

This Excel export sample demonstrates:

1. **ExcelJS Integration**: Uses ExcelJS library for robust Excel file generation
2. **CSV Generation**: Implements CSV export using built-in Node.js modules
3. **Configurable Columns**: Allows users to select which columns to include in exports
4. **Metadata Inclusion**: Option to include extraction metadata in exports
5. **Proper Formatting**: Formats data appropriately for Excel (percentages, dates)
6. **Styling**: Applies professional styling to Excel sheets (headers, alternating rows)
7. **Data Escaping**: Properly escapes CSV fields to prevent injection issues
8. **File Management**: Handles file creation, storage, and cleanup
9. **API Integration**: Shows how to integrate export functionality with REST API
10. **Error Handling**: Comprehensive error handling for export operations
11. **Security**: Implements proper file access controls and expiration

The implementation supports both Excel (.xlsx) and CSV formats with consistent data representation across both formats.
}

module.exports = { addScrapingJob };
```

This scraper worker sample demonstrates:

1. **Playwright Integration**: Uses Playwright for robust browser automation
2. **Robots.txt Compliance**: Checks and respects robots.txt directives
3. **Captcha Detection**: Identifies when captchas are present and flags for manual review
4. **Data Extraction**: Extracts business information using configurable selectors
5. **Phone Number Normalization**: Uses libphonenumber-js to normalize phone numbers to E.164 format
6. **Email Validation**: Validates email addresses using validator.js
7. **Queue Integration**: Shows how to integrate with Bull Queue for job management
8. **Error Handling**: Comprehensive error handling with appropriate status reporting
9. **Resource Optimization**: Blocks unnecessary resources (images, fonts) to speed up scraping
10. **Metadata Extraction**: Extracts website title and description

The implementation is modular and can be extended to support additional data sources and extraction techniques.
# Data Extractor Web App - Technical Architecture

## Overview

This document provides a comprehensive technical architecture for the Data Extractor web app, which finds and extracts business contact information from multiple sources. The system supports web directories, Google Maps, business listing sites, Yellow Pages, LinkedIn company pages, uploaded files, and CSVs. It offers scheduled extraction and exports cleaned results into Excel (.xlsx) and CSV formats.

The architecture is designed with the following key principles:
- Respect for robots.txt and terms of service
- Ethical data extraction with user consent for flagged sources
- Modular design for easy maintenance and extension
- Security and compliance with data privacy regulations
- Scalability for handling large datasets
- User-friendly interface for managing extraction jobs

## Table of Contents
1. Tech Stack Recommendation
2. High-Level Architecture & Data Flow
3. Database Schema Design
4. Key API Endpoints
5. Scraper Worker Sample
6. Excel Export Sample
7. AI Extractor Example
8. Security, Legal & Operations Checklist
9. Minimal Viable Product (MVP) Development Plan