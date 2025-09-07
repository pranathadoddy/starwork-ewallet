# E-Wallet API

A secure multi-user digital wallet API built with NestJS and MySQL. This comprehensive system supports user registration, authentication, deposits, transfers, and payments with role-based access control and session management.

## 🚀 Features

### Part 1 - System Design (50 Points)

#### 1. Flowchart Diagrams (20 Points)

**a. User Deposit Request & Admin Approval Flow**

```mermaid
flowchart TD
    A[User Login] --> B[User Request Deposit]
    B --> C[POST /deposits/request]
    C --> D[Validate Amount > 0.01]
    D --> E[Create Transaction Record]
    E --> F[Set Status: PENDING]
    F --> G[Save to Database]
    G --> H[Return Deposit Request ID]
    
    I[Admin Login] --> J[Admin View Pending Deposits]
    J --> K[GET /deposits/pending]
    K --> L[Retrieve All PENDING Deposits]
    L --> M[Display Deposit List with User Info]
    
    M --> N[Admin Approves Deposit]
    N --> O[POST /deposits/approve]
    O --> P[Start Database Transaction]
    P --> Q[Find Transaction by ID]
    Q --> R{Transaction Found?}
    R -->|No| S[Return Error: Not Found]
    R -->|Yes| T[Find/Create User Wallet]
    T --> U[Update Transaction Status: COMPLETED]
    U --> V[Add Amount to Wallet Balance]
    V --> W[Commit Transaction]
    W --> X[Return Success Response]
    
    style B fill:#e1f5fe
    style N fill:#e8f5e8
    style P fill:#fff3e0
    style W fill:#c8e6c9
```

**b. User-to-User Transfer Flow**

```mermaid
flowchart TD
    A[User Login] --> B[User Initiates Transfer]
    B --> C[POST /wallet/transfer]
    C --> D[Validate Transfer Data]
    D --> E[Start Database Transaction]
    E --> F[Find Recipient by Email]
    F --> G{Recipient Found?}
    G -->|No| H[Return Error: User Not Found]
    G -->|Yes| I[Check Self Transfer]
    I --> J{Transfer to Self?}
    J -->|Yes| K[Return Error: Cannot Transfer to Self]
    J -->|No| L[Get Sender Wallet]
    L --> M{Sender Wallet Exists?}
    M -->|No| N[Return Error: Wallet Not Found]
    M -->|Yes| O[Check Sufficient Balance]
    O --> P{Balance >= Amount?}
    P -->|No| Q[Return Error: Insufficient Balance]
    P -->|Yes| R[Get/Create Recipient Wallet]
    R --> S[Create Transfer Transaction]
    S --> T[Set Status: COMPLETED]
    T --> U[Deduct from Sender Balance]
    U --> V[Add to Recipient Balance]
    V --> W[Save All Changes]
    W --> X[Commit Transaction]
    X --> Y[Return Transfer Success]
    
    style B fill:#e1f5fe
    style E fill:#fff3e0
    style X fill:#c8e6c9
    style Y fill:#e8f5e8
```

#### 2. ER Diagram (20 Points)

Database schema design for users, roles, wallets, and stateful transactions:

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        enum role
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    WALLETS {
        uuid id PK
        decimal balance
        uuid userId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    TRANSACTIONS {
        uuid id PK
        enum type
        enum status
        decimal amount
        string description
        uuid userId FK
        uuid recipientId FK
        timestamp createdAt
        timestamp updatedAt
    }
    
    SESSIONS {
        uuid id PK
        uuid userId FK
        string token
        boolean isActive
        string deviceInfo
        string ipAddress
        timestamp createdAt
        timestamp lastUsedAt
    }
    
    USERS ||--o{ WALLETS : "has"
    USERS ||--o{ TRANSACTIONS : "creates"
    USERS ||--o{ SESSIONS : "has"
    USERS ||--o{ TRANSACTIONS : "receives"
```

#### 3. Sequence Diagram (10 Points)

**Deposit Approval Process** - UML Sequence Diagram showing interactions between Admin, API, and Database:

```mermaid
sequenceDiagram
    participant Admin
    participant API
    participant Database
    participant WalletService
    
    Admin->>API: GET /deposits/pending
    API->>Database: Query PENDING transactions
    Database-->>API: Return pending deposits
    API-->>Admin: Display pending deposits
    
    Admin->>API: POST /deposits/approve
    Note over API: { transactionId: "uuid" }
    API->>WalletService: approveDeposit(transactionId)
    
    WalletService->>Database: Start Transaction
    WalletService->>Database: Find transaction by ID
    Database-->>WalletService: Return transaction data
    
    WalletService->>Database: Find/Create user wallet
    Database-->>WalletService: Return wallet data
    
    WalletService->>Database: Update transaction status to COMPLETED
    WalletService->>Database: Update wallet balance (+amount)
    WalletService->>Database: Commit Transaction
    
    Database-->>WalletService: Transaction committed
    WalletService-->>API: Return success response
    API-->>Admin: Deposit approved successfully
```

### Part 2 - User & Admin Management (50 Points)

✅ **User Registration (10 Points)**
- Endpoint: `POST /users/register`
- Password securely hashed using bcryptjs
- Automatic wallet creation for new users

✅ **Admin Seeding (5 Points)**
- Automatic admin user creation on application startup
- Default admin credentials: `admin@ewallet.com` / `admin123`

✅ **Role-Based JWTs (15 Points)**
- JWT tokens contain user ID and role (USER/ADMIN)
- Secure token generation and validation

✅ **Endpoint Protection (15 Points)**
- Role-based middleware for protecting endpoints
- Some endpoints accessible only by USER role
- Some endpoints accessible only by ADMIN role

✅ **HTTP Status Codes (5 Points)**
- Proper HTTP status codes for all responses
- 201 for successful creation
- 401 for unauthorized access
- 403 for forbidden access
- 409 for conflicts

### Part 3 - Login & Session Management (50 Points)

✅ **Login API (15 Points)**
- Endpoint: `POST /auth/login`
- Accepts user credentials and returns role-based JWT
- Device and IP tracking for session management

✅ **Success Response (10 Points)**
- Returns user data (excluding password) and generated token
- Proper response structure with user information

✅ **Error Response (10 Points)**
- Appropriate error messages for failed login attempts
- Proper HTTP status codes (401 for invalid credentials)

✅ **Single Sign-On (SSO) (15 Points)**
- Single-session policy implementation
- New login invalidates previous sessions
- Session tracking and management
- Logout functionality for current and all sessions

### Part 4 - Deposit Workflow (50 Points)

✅ **User: Request Deposit (15 Points)**
- Endpoint: `POST /deposits/request`
- USER-protected endpoint for deposit requests
- Creates transaction record with PENDING status
- Does NOT immediately update wallet balance

✅ **Admin: List Pending Deposits (10 Points)**
- Endpoint: `GET /deposits/pending`
- ADMIN-protected endpoint to list all pending deposits
- Returns detailed deposit information with user data

✅ **Admin: Approve Deposit (25 Points)**
- Endpoint: `POST /deposits/approve`
- ADMIN-protected endpoint to approve deposits
- Atomic operation: updates transaction status AND wallet balance
- Uses database transactions to ensure data integrity

### Part 5 - Wallet Transactions (50 Points)

✅ **User: Transfer to Other User (25 Points)**
- Endpoint: `POST /wallet/transfer`
- USER-protected endpoint for user-to-user transfers
- Atomic operation: debits sender and credits receiver
- Safe from concurrency issues (race conditions)
- Prevents self-transfers and validates sufficient balance

✅ **User: Pay with Balance (15 Points)**
- Endpoint: `POST /wallet/pay`
- USER-protected endpoint for payments
- Atomic operation: debits user's balance
- Validates sufficient balance before processing

✅ **User: Check Balance (10 Points)**
- Endpoint: `GET /wallet/balance`
- USER-protected endpoint to check current balance
- Endpoint: `GET /wallet/transactions`
- View complete transaction history

## 🛠 Technology Stack

- **Language:** TypeScript
- **Framework:** NestJS
- **Database:** MySQL
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **Validation:** class-validator
- **ORM:** TypeORM
- **Testing:** Jest
- **Containerization:** Docker & Docker Compose

## 📋 Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn

## 🚀 Getting Started

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
2. **Start the database services:**
   ```bash
   npm run docker:db
   ```
   This will start MySQL and phpMyAdmin.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the application:**
   ```bash
   npm run start:dev
   ```

### Option 2: Local MySQL

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials.

4. **Start MySQL and create the database:**
   ```sql
   CREATE DATABASE ewallet_db;
   ```

5. **Run the application:**
   ```bash
   npm run start:dev
   ```

## 🐳 Docker Services

- **MySQL**: `localhost:3308`
- **phpMyAdmin**: `http://localhost:8080`
- **API**: `http://localhost:3001` (or 3000 if available)

### Database Credentials
- **Host:** `localhost`
- **Port:** `3308`
- **Database:** `ewallet_db`
- **Username:** `root`
- **Password:** `password`

### phpMyAdmin Access
- **URL:** `http://localhost:8080`
- **Username:** `root`
- **Password:** `password`

The application will start and automatically create the admin user.

## 🧪 API Testing

### Postman Collection
A comprehensive Postman collection is provided for easy API testing:

1. **Import Collection:** `E-Wallet_API.postman_collection.json`
2. **Import Environment:** `E-Wallet_API.postman_environment.json`
3. **Follow the guide:** `POSTMAN_TESTING_GUIDE.md`

The collection includes:
- Pre-configured requests for all endpoints
- Environment variables for easy token management
- Organized folders by functionality
- Example request bodies and responses

### Quick Test Setup
1. Start the application: `npm run start:dev`
2. Import the Postman collection and environment
3. Run the "API Health Check" request
4. Follow the testing workflow in the guide

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format

#### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

#### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔐 Authentication Endpoints

### Register User
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "token": "jwt-token"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Logout All Sessions
```http
POST /auth/logout-all
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "All sessions logged out successfully"
}
```

### Get Active Sessions
```http
GET /auth/sessions
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Active sessions retrieved successfully",
  "sessions": [
    {
      "id": "session-uuid",
      "deviceInfo": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "lastUsedAt": "2024-01-01T12:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## 👤 User Management

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "firstName": "John Updated",
  "lastName": "Doe Updated"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "role": "USER"
  }
}
```

### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Create Admin (Admin Only)
```http
POST /auth/create-admin
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "email": "newadmin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Response:**
```json
{
  "message": "Admin created successfully"
}
```

## 💰 Deposit Management

### Create Deposit Request (User Only)
```http
POST /deposits/request
Authorization: Bearer <user-jwt-token>
Content-Type: application/json

{
  "amount": 100.50,
  "description": "Initial deposit"
}
```

**Response:**
```json
{
  "message": "Deposit request created successfully",
  "deposit": {
    "id": "transaction-uuid",
    "amount": 100.50,
    "description": "Initial deposit",
    "status": "PENDING",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### Get Pending Deposits (Admin Only)
```http
GET /deposits/pending
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "message": "Pending deposits retrieved successfully",
  "deposits": [
    {
      "id": "transaction-uuid",
      "amount": 100.50,
      "description": "Initial deposit",
      "userId": "user-uuid",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Approve Deposit (Admin Only)
```http
POST /deposits/approve
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "depositId": "transaction-uuid"
}
```

**Response:**
```json
{
  "message": "Deposit approved successfully",
  "deposit": {
    "id": "transaction-uuid",
    "amount": 100.50,
    "status": "COMPLETED"
  },
  "newBalance": 100.50
}
```

### Get User Deposits (User Only)
```http
GET /deposits/my-deposits
Authorization: Bearer <user-jwt-token>
```

**Response:**
```json
{
  "message": "User deposits retrieved successfully",
  "deposits": [
    {
      "id": "transaction-uuid",
      "amount": 100.50,
      "description": "Initial deposit",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## 💳 Wallet Management

### Get Wallet Balance (User Only)
```http
GET /wallet/balance
Authorization: Bearer <user-jwt-token>
```

**Response:**
```json
{
  "message": "Balance retrieved successfully",
  "balance": {
    "balance": 100.50,
    "userId": "user-uuid",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Transfer to Another User (User Only)
```http
POST /wallet/transfer
Authorization: Bearer <user-jwt-token>
Content-Type: application/json

{
  "recipientEmail": "recipient@example.com",
  "amount": 50.00,
  "description": "Payment for services"
}
```

**Response:**
```json
{
  "message": "Transfer completed successfully",
  "transaction": {
    "id": "transaction-uuid",
    "amount": 50.00,
    "type": "TRANSFER",
    "status": "COMPLETED",
    "newBalance": 50.50
  }
}
```

### Pay with Balance (User Only)
```http
POST /wallet/pay
Authorization: Bearer <user-jwt-token>
Content-Type: application/json

{
  "amount": 25.00,
  "description": "Purchase item"
}
```

**Response:**
```json
{
  "message": "Payment completed successfully",
  "transaction": {
    "id": "transaction-uuid",
    "amount": 25.00,
    "type": "PAYMENT",
    "status": "COMPLETED",
    "newBalance": 25.50
  }
}
```

### Get Transaction History (User Only)
```http
GET /wallet/transactions?page=1&limit=10
Authorization: Bearer <user-jwt-token>
```

**Response:**
```json
{
  "message": "Transaction history retrieved successfully",
  "transactions": [
    {
      "id": "transaction-uuid",
      "type": "TRANSFER",
      "status": "COMPLETED",
      "amount": 50.00,
      "description": "Payment for services",
      "recipientId": "recipient-uuid",
      "recipient": {
        "id": "recipient-uuid",
        "email": "recipient@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `role` (Enum: USER, ADMIN)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Wallets Table
- `id` (UUID, Primary Key)
- `balance` (Decimal)
- `userId` (UUID, Foreign Key)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Transactions Table
- `id` (UUID, Primary Key)
- `type` (Enum: DEPOSIT, TRANSFER, PAYMENT)
- `status` (Enum: PENDING, COMPLETED, FAILED)
- `amount` (Decimal)
- `description` (String, Optional)
- `userId` (UUID, Foreign Key)
- `recipientId` (UUID, Foreign Key, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Sessions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `token` (String)
- `isActive` (Boolean)
- `deviceInfo` (String, Optional)
- `ipAddress` (String, Optional)
- `createdAt` (Timestamp)
- `lastUsedAt` (Timestamp, Optional)

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Different endpoints for USER and ADMIN roles
4. **Session Management**: Single Sign-On (SSO) with session tracking
5. **Input Validation**: All inputs are validated using class-validator
6. **SQL Injection Protection**: Using TypeORM with parameterized queries
7. **CORS**: Cross-Origin Resource Sharing enabled
8. **Atomic Transactions**: Database transactions ensure data integrity

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Test Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## 🐳 Docker Commands

```bash
# Start database only
npm run docker:db

# Stop database
npm run docker:db:stop

# Start full application with Docker
npm run docker:up

# Stop all services
npm run docker:down

# Build application
npm run docker:build

# View logs
npm run docker:logs
```

## 🌍 Environment Variables

Required environment variables:
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `PORT` - Application port
- `NODE_ENV` - Environment (development/production)

## 📋 Default Admin Credentials

- **Email:** admin@ewallet.com
- **Password:** admin123

## 🚀 Deployment

### Docker
Use the provided Docker Compose setup:
```bash
npm run docker:up
```

### Production Build
```bash
npm run build
npm run start:prod
```

## 📖 Postman Testing Guide

### Setup Instructions

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `E-Wallet_API.postman_collection.json`

2. **Import Environment:**
   - Click "Import" button again
   - Select `E-Wallet_API.postman_environment.json`
   - Select the "E-Wallet API Environment" from the environment dropdown

### Testing Workflow

1. **Health Check** → Verify API is running
2. **User Registration** → Create test user
3. **Authentication** → Login and get tokens
4. **Deposit Flow** → Request and approve deposits
5. **Wallet Operations** → Test transfers and payments
6. **Session Management** → Test logout functionality

### Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3001` |
| `user_token` | JWT token for regular user | Auto-populated after login |
| `admin_token` | JWT token for admin user | Auto-populated after login |
| `deposit_id` | ID of a deposit request | Auto-populated after deposit request |
| `user_email` | Regular user email | `user@example.com` |
| `user_password` | Regular user password | `password123` |
| `admin_email` | Admin user email | `admin@ewallet.com` |
| `admin_password` | Admin user password | `admin123` |
| `recipient_email` | Email for transfer recipient | `recipient@example.com` |

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Make sure the application is running on the correct port
   - Check if the database is running

2. **401 Unauthorized:**
   - Make sure you're using a valid JWT token
   - Check if the token has expired
   - Verify the Authorization header format: `Bearer <token>`

3. **403 Forbidden:**
   - Check if you have the correct role for the endpoint
   - Admin endpoints require ADMIN role
   - User endpoints require USER role

4. **400 Bad Request:**
   - Check the request body format
   - Verify all required fields are provided
   - Check data validation rules

### Database Issues
- If you get database connection errors, make sure MySQL is running:
  ```bash
  npm run docker:db
  ```

### Port Conflicts
- If port 3000/3001 is in use, update the `base_url` environment variable
- If port 3308 (MySQL) is in use, check the docker-compose.yml file

## 📝 Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

#### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Forbidden (403)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

#### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

## 📊 Data Models

### User
```typescript
{
  id: string;           // UUID
  email: string;        // Unique email address
  password: string;     // Hashed password
  firstName: string;    // User's first name
  lastName: string;     // User's last name
  role: "USER" | "ADMIN"; // User role
  isActive: boolean;    // Account status
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Wallet
```typescript
{
  id: string;           // UUID
  balance: number;      // Current balance (decimal)
  userId: string;       // Owner user ID
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Transaction
```typescript
{
  id: string;                    // UUID
  type: "DEPOSIT" | "TRANSFER" | "PAYMENT"; // Transaction type
  status: "PENDING" | "COMPLETED" | "FAILED"; // Transaction status
  amount: number;                // Transaction amount (decimal)
  description?: string;          // Optional description
  userId: string;                // User who initiated transaction
  recipientId?: string;          // Recipient user ID (for transfers)
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Session
```typescript
{
  id: string;           // UUID
  userId: string;       // User ID
  token: string;        // JWT token
  isActive: boolean;    // Session status
  deviceInfo?: string;  // Device information
  ipAddress?: string;   // IP address
  createdAt: Date;      // Creation timestamp
  lastUsedAt?: Date;    // Last activity timestamp
}
```

## 🎯 API Testing Scenarios

### Scenario 1: Complete User Journey
1. Register a new user
2. Login and get token
3. Request a deposit
4. Login as admin and approve deposit
5. Check balance
6. Transfer money to another user
7. Make a payment
8. View transaction history

### Scenario 2: Session Management
1. Login from multiple devices (simulate by running login multiple times)
2. Check active sessions
3. Logout from current session
4. Logout from all sessions
5. Verify sessions are invalidated

### Scenario 3: Error Handling
1. Try to transfer more money than available balance
2. Try to access admin endpoints with user token
3. Try to access protected endpoints without token
4. Try to approve non-existent deposit

## 📈 Performance & Scalability

- **Atomic Transactions**: All financial operations use database transactions
- **Concurrency Safe**: Race condition protection for transfers and payments
- **Session Management**: Efficient session tracking and cleanup
- **Input Validation**: Comprehensive validation prevents invalid data
- **Error Handling**: Proper error responses with appropriate HTTP status codes

## 🔄 Development Workflow

1. **Start Database**: `npm run docker:db`
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run start:dev`
4. **Run Tests**: `npm test`
5. **Check Coverage**: `npm run test:cov`
6. **Lint Code**: `npm run lint`

## 📞 Support

For support and questions:
1. Check the application logs
2. Verify the database connection
3. Ensure all environment variables are set correctly
4. Check the API documentation for endpoint requirements
5. Review the troubleshooting section above

## 📄 License

This project is part of a technical test implementation for an E-Wallet API system.

---

**Built with ❤️ using NestJS, TypeScript, and MySQL**