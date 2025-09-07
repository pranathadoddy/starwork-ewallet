# E-Wallet API Documentation

## Overview

The E-Wallet API is a secure multi-user digital wallet system built with NestJS and MySQL. It supports user registration, authentication, deposits, transfers, and payments with role-based access control.

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## API Endpoints

### Authentication

#### Register User
**POST** `/users/register`

Creates a new user account and automatically creates a wallet.

**Request Body:**
```json
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

**Validation:**
- Email must be valid and unique
- Password minimum 6 characters
- First name and last name required

#### Login
**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
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

#### Logout
**POST** `/auth/logout`

Logs out the current session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### Logout All Sessions
**POST** `/auth/logout-all`

Logs out all sessions for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "All sessions logged out successfully"
}
```

#### Get Active Sessions
**GET** `/auth/sessions`

Returns all active sessions for the current user.

**Headers:** `Authorization: Bearer <token>`

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

### User Management

#### Get All Users (Admin Only)
**GET** `/users`

Returns all users in the system.

**Headers:** `Authorization: Bearer <admin-token>`

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

#### Create Admin (Admin Only)
**POST** `/auth/create-admin`

Creates a new admin user.

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "email": "admin@example.com",
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

### Deposit Management

#### Create Deposit Request (User Only)
**POST** `/deposits/request`

Creates a deposit request that requires admin approval.

**Headers:** `Authorization: Bearer <user-token>`

**Request Body:**
```json
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

**Validation:**
- Amount must be positive and minimum 0.01
- Description is optional

#### Get Pending Deposits (Admin Only)
**GET** `/deposits/pending`

Returns all pending deposit requests.

**Headers:** `Authorization: Bearer <admin-token>`

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
**POST** `/deposits/approve`

Approves a pending deposit and updates the user's wallet balance.

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
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
**GET** `/deposits/my-deposits`

Returns the current user's deposit history.

**Headers:** `Authorization: Bearer <user-token>`

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
**GET** `/wallet/balance`

Returns the current user's wallet balance and information.

**Headers:** `Authorization: Bearer <user-token>`

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
**POST** `/wallet/transfer`

Transfers money to another user by email.

**Headers:** `Authorization: Bearer <user-token>`

**Request Body:**
```json
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

**Validation:**
- Recipient email must exist
- Amount must be positive and minimum 0.01
- User cannot transfer to themselves
- User must have sufficient balance

#### Pay with Balance (User Only)
**POST** `/wallet/pay`

Makes a payment using wallet balance.

**Headers:** `Authorization: Bearer <user-token>`

**Request Body:**
```json
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

**Validation:**
- Amount must be positive and minimum 0.01
- User must have sufficient balance

#### Get Transaction History (User Only)
**GET** `/wallet/transactions`

Returns the current user's complete transaction history.

**Headers:** `Authorization: Bearer <user-token>`

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

## Data Models

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

## Error Handling

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

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Different endpoints for USER and ADMIN roles
4. **Session Management**: Single Sign-On (SSO) with session tracking
5. **Input Validation**: All inputs are validated using class-validator
6. **SQL Injection Protection**: Using TypeORM with parameterized queries
7. **CORS**: Cross-Origin Resource Sharing enabled

## Default Admin Credentials

- **Email:** admin@ewallet.com
- **Password:** admin123

## Testing

### Unit Tests
Run unit tests with:
```bash
npm run test
```

### Test Coverage
Generate test coverage report:
```bash
npm run test:cov
```

### E2E Tests
Run end-to-end tests:
```bash
npm run test:e2e
```

## Deployment

### Docker
Use the provided Docker Compose setup:
```bash
npm run docker:up
```

### Environment Variables
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

## Support

For support and questions, please contact the development team.
