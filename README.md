# Blog CRUD API

A production-ready RESTful API for a blog platform built with Node.js, TypeScript, Express.js, and PostgreSQL.

## Features

- 🔐 **Authentication**: JWT-based authentication with OAuth 2.0 support (Google & GitHub)
- 📝 **Article Management**: Full CRUD operations for blog articles
- 🔒 **Security**: Password hashing, JWT tokens, rate limiting, CORS, and Helmet.js
- ✅ **Validation**: Request validation using Joi
- 📊 **Pagination**: Built-in pagination for article listings
- 🏗️ **Clean Architecture**: Layered architecture with separation of concerns
- 🗄️ **Database**: PostgreSQL with proper indexes and constraints
- 🚀 **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + OAuth 2.0 (Google, GitHub)
- **Validation**: Joi
- **Security**: Helmet.js, bcrypt, express-rate-limit

## Project Structure

```
src/
├── config/          # Database and OAuth configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── models/          # Database models/entities (types)
├── routes/          # API route definitions
├── services/        # Business logic
├── repositories/    # Database queries
├── utils/           # Helper functions
├── types/           # TypeScript type definitions
└── index.ts         # Application entry point
```

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose (for database)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thinking-ragib-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Or manually create .env file based on env.example
   ```
   
   Edit `.env` and fill in your configuration:
   - Database connection string
   - JWT secrets
   - OAuth credentials (optional)

4. **Set up the database (using Docker)**
   ```bash
   # Start PostgreSQL container
   docker compose up -d
   
   # Or use the helper script
   ./scripts/db-start.sh
   
   # Run migrations to create tables
   ./scripts/db-setup.sh
   
   # Or manually run migrations
   docker exec -i blog_db psql -U postgres -d blog_db < migrations/001_initial_schema.sql
   ```
   
   **Note:** The database runs on port `5433` (mapped from container port 5432) to avoid conflicts with local PostgreSQL if installed.
   
   **Database credentials:**
   - Host: `localhost`
   - Port: `5433`
   - Database: `blog_db`
   - Username: `postgres`
   - Password: `postgres`
   
   **Useful commands:**
   ```bash
   # Start database
   docker compose up -d
   # or
   ./scripts/db-start.sh
   
   # Stop database
   docker compose down
   # or
   ./scripts/db-stop.sh
   
   # View database logs
   docker logs blog_db
   
   # Access PostgreSQL CLI
   docker exec -it blog_db psql -U postgres -d blog_db
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# OAuth 2.0 - Google (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth 2.0 - GitHub (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# CORS
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "..."
  }
}
```

#### GET `/api/auth/google`
Initiate Google OAuth login.

#### GET `/api/auth/github`
Initiate GitHub OAuth login.

### Articles

#### POST `/api/articles`
Create a new article (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "published_at": "2024-01-01T00:00:00.000Z" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article created successfully",
  "data": {
    "id": 1,
    "title": "My First Blog Post",
    "content": "This is the content...",
    "slug": "my-first-blog-post",
    "author_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "published_at": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

#### GET `/api/articles`
Get all articles (public).

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `sort` (default: desc) - Sort order (asc/desc)

**Example:**
```
GET /api/articles?page=1&limit=10&sort=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Articles retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET `/api/articles/:id`
Get a single article by ID (public).

**Response:**
```json
{
  "success": true,
  "message": "Article retrieved successfully",
  "data": { ... }
}
```

#### PUT `/api/articles/:id`
Update an article (requires authentication, only author can update).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Title", // Optional
  "content": "Updated content...", // Optional
  "published_at": "2024-01-01T00:00:00.000Z" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Article updated successfully",
  "data": { ... }
}
```

#### DELETE `/api/articles/:id`
Delete an article (requires authentication, only author can delete).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection failed)

## Security Features

- **Password Hashing**: Uses bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes per IP)
- **Helmet.js**: Sets security HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: All inputs validated using Joi
- **SQL Injection Prevention**: Parameterized queries
- **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR, NOT NULL)
- `name` (VARCHAR, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Articles Table
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR, NOT NULL)
- `content` (TEXT, NOT NULL)
- `author_id` (INTEGER, FOREIGN KEY → users.id)
- `slug` (VARCHAR, UNIQUE, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `published_at` (TIMESTAMP, NULLABLE)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

### Code Structure

The project follows a clean architecture pattern:

- **Routes**: Define API endpoints and middleware
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle database operations
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions (JWT, password hashing, etc.)

## Testing

To test the API, you can use tools like:
- Postman
- cURL
- HTTPie
- Insomnia

Example cURL commands:

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Create Article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title":"Test Article","content":"This is a test article"}'

# Get Articles
curl http://localhost:3000/api/articles?page=1&limit=10
```

## OAuth 2.0 Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## Error Handling

The API uses centralized error handling. All errors are caught and returned in a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ // Only for validation errors
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on the repository.

