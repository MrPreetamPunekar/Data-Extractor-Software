# AI-Powered Business Data Extractor - Project Structure

## Directory Structure

```
ai-business-data-extractor/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── workers/        # Scraping workers
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── app.js          # Express app entry point
│   ├── tests/              # Unit and integration tests
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Backend Docker configuration
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── assets/         # Images, stylesheets
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── Dockerfile          # Frontend Docker configuration
├── worker/                 # Scraper worker service
│   ├── src/
│   │   ├── scrapers/       # Web scraping modules
│   │   ├── ai/             # AI extraction modules
│   │   ├── processors/     # Data processing modules
│   │   ├── exporters/      # Export modules
│   │   ├── utils/          # Utility functions
│   │   └── worker.js       # Worker entry point
│   ├── package.json        # Worker dependencies
│   └── Dockerfile          # Worker Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── docker-compose.dev.yml  # Development Docker Compose configuration
├── docker-compose.prod.yml # Production Docker Compose configuration
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## Docker Configuration

### 1. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Worker Dockerfile

```dockerfile
# worker/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install-deps
RUN npx playwright install chromium

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

CMD ["npm", "start"]
```

### 4. Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: data_extractor_db
    restart: always
    environment:
      POSTGRES_DB: data_extractor
      POSTGRES_USER: extractor_user
      POSTGRES_PASSWORD: extractor_password
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U extractor_user -d data_extractor"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for job queue
  redis:
    image: redis:7-alpine
    container_name: data_extractor_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: data_extractor_backend
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=data_extractor
      - DB_USER=extractor_user
      - DB_PASSWORD=extractor_password
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules
    env_file:
      - .env

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: data_extractor_frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  # Worker Service
  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile
    container_name: data_extractor_worker
    restart: always
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=data_extractor
      - DB_USER=extractor_user
      - DB_PASSWORD=extractor_password
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./worker:/app
      - /app/node_modules

volumes:
  db_data:
  redis_data:
```

### 5. Development Docker Compose Configuration

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=data_extractor
      - DB_USER=extractor_user
      - DB_PASSWORD=extractor_password
      - REDIS_URL=redis://redis:6379
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:3001
    command: npm start

  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile.dev
    volumes:
      - ./worker:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=data_extractor
      - DB_USER=extractor_user
      - DB_PASSWORD=extractor_password
      - REDIS_URL=redis://redis:6379
    command: npm run dev
```

### 6. Environment Variables Example

```env
# .env.example
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=data_extractor
DB_USER=extractor_user
DB_PASSWORD=extractor_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# API Keys (for external services)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
YELP_API_KEY=your_yelp_api_key

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Playwright
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=true
```

## Next Steps

1. Create the directory structure as outlined above
2. Initialize each component with npm init
3. Set up the Docker configuration files
4. Configure environment variables
5. Set up Git repository with appropriate .gitignore