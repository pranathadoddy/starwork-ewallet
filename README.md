# E-Wallet API

A secure multi-user digital wallet API built with NestJS and MySQL.

## Features

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

## Technology Stack

- **Language:** TypeScript
- **Framework:** NestJS
- **Database:** MySQL
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **Validation:** class-validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn

### Option 1: Using Docker (Recommended)

1. Clone the repository
2. Start the database services:
   ```bash
   npm run docker:db
   ```
   This will start PostgreSQL and PgAdmin.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the application:
   ```bash
   npm run start:dev
   ```

### Option 2: Local MySQL

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials.

4. Start MySQL and create the database:
   ```sql
   CREATE DATABASE ewallet_db;
   ```

5. Run the application:
   ```bash
   npm run start:dev
   ```

### Docker Services

- **MySQL**: `localhost:3307`
- **phpMyAdmin**: `http://localhost:8080`
- **API**: `http://localhost:3000`

### phpMyAdmin Credentials
- Username: `root`
- Password: `password`

### Database Credentials
- Host: `localhost`
- Port: `3307`
- Database: `ewallet_db`
- Username: `root`
- Password: `password`

The application will start on `http://localhost:3000` and automatically create the admin user.

## API Testing

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

## API Endpoints

### Authentication

#### Register User
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

#### Login
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

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer <admin-jwt-token>
```

#### Create Admin (Admin Only)
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

#### Logout
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

#### Logout All Sessions
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

#### Get Active Sessions
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

### Deposit Management

#### Create Deposit Request (User Only)
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

#### Get Pending Deposits (Admin Only)
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

#### Approve Deposit (Admin Only)
```http
POST /deposits/approve
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "transactionId": "transaction-uuid"
}
```

**Response:**
```json
{
  "message": "Deposit approved successfully",
  "transaction": {
    "id": "transaction-uuid",
    "amount": 100.50,
    "status": "COMPLETED",
    "newBalance": 100.50
  }
}
```

#### Get User Deposits (User Only)
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

### Wallet Management

#### Get Wallet Balance (User Only)
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

#### Transfer to Another User (User Only)
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
  "transfer": {
    "id": "transaction-uuid",
    "amount": 50.00,
    "description": "Payment for services",
    "status": "COMPLETED",
    "recipientId": "recipient-uuid",
    "recipient": {
      "id": "recipient-uuid",
      "email": "recipient@example.com",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Pay with Balance (User Only)
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
    "description": "Purchase item",
    "status": "COMPLETED",
    "newBalance": 75.50
  }
}
```

#### Get Transaction History (User Only)
```http
GET /wallet/transactions
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
  ]
}
```

## Database Schema

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

## Default Admin Credentials

- **Email:** admin@ewallet.com
- **Password:** admin123

## Development

### Running Tests
```bash
npm run test
```

### Code Coverage
```bash
npm run test:cov
```

### Linting
```bash
npm run lint
```

## Next Steps

This implementation covers Part 2 of the technical test. The following parts are ready to be implemented:

- Part 3: Login & Session Management
- Part 4: Deposit Workflow
- Part 5: Wallet Transactions
- Part 6: Deploy, Test, and Documentation