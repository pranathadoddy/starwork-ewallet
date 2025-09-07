# Postman Testing Guide for E-Wallet API

This guide will help you test the E-Wallet API using the provided Postman collection and environment.

## Setup Instructions

### 1. Import Collection and Environment

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `E-Wallet_API.postman_collection.json`
   - The collection will be imported with all endpoints organized in folders

2. **Import Environment:**
   - Click "Import" button again
   - Select `E-Wallet_API.postman_environment.json`
   - Select the "E-Wallet API Environment" from the environment dropdown

### 2. Start the Application

Before testing, make sure the application is running:

```bash
# Start the database
npm run docker:db

# Start the application
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Testing Workflow

### Step 1: Health Check
- Run the **"API Health Check"** request
- Should return `200 OK` with "Hello World!"

### Step 2: User Registration
- Run the **"Register User"** request
- This creates a regular user account
- Note: The admin user is automatically created when the app starts

### Step 3: Authentication
- Run the **"Login"** request with user credentials
- Copy the `accessToken` from the response
- Set the `user_token` environment variable with this token

### Step 4: Admin Authentication (Optional)
- Run the **"Create Admin"** request if needed
- Run the **"Login"** request with admin credentials
- Copy the `accessToken` from the response
- Set the `admin_token` environment variable with this token

### Step 5: Test Deposit Flow
1. **Request Deposit:**
   - Run **"Request Deposit"** (requires user token)
   - Copy the `id` from the response
   - Set the `deposit_id` environment variable

2. **Approve Deposit (Admin):**
   - Run **"Get Pending Deposits"** (requires admin token)
   - Run **"Approve Deposit"** (requires admin token and deposit_id)

3. **Check User Deposits:**
   - Run **"Get User Deposits"** (requires user token)

### Step 6: Test Wallet Operations
1. **Check Balance:**
   - Run **"Get Balance"** (requires user token)

2. **Transfer Money:**
   - Run **"Transfer Money"** (requires user token)
   - Make sure the recipient user exists

3. **Make Payment:**
   - Run **"Pay with Balance"** (requires user token)

4. **View Transaction History:**
   - Run **"Get Transaction History"** (requires user token)

### Step 7: Test Session Management
- Run **"Get Active Sessions"** (requires user token)
- Run **"Logout"** (requires user token)
- Run **"Logout All Sessions"** (requires user token)

## Environment Variables

The following variables are available in the environment:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3000` |
| `user_token` | JWT token for regular user | Auto-populated after login |
| `admin_token` | JWT token for admin user | Auto-populated after login |
| `deposit_id` | ID of a deposit request | Auto-populated after deposit request |
| `user_email` | Regular user email | `user@example.com` |
| `user_password` | Regular user password | `password123` |
| `admin_email` | Admin user email | `admin@example.com` |
| `admin_password` | Admin user password | `admin123` |
| `recipient_email` | Email for transfer recipient | `recipient@example.com` |

## Test Scenarios

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

## Expected Responses

### Successful Login Response
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "USER"
  },
  "accessToken": "jwt-token-here"
}
```

### Successful Deposit Request
```json
{
  "message": "Deposit request created successfully",
  "deposit": {
    "id": "deposit-id",
    "amount": 100.00,
    "status": "PENDING",
    "description": "Initial deposit"
  }
}
```

### Successful Transfer
```json
{
  "message": "Transfer completed successfully",
  "transaction": {
    "id": "transaction-id",
    "amount": 50.00,
    "type": "TRANSFER",
    "status": "COMPLETED",
    "newBalance": 50.00
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Make sure the application is running on port 3000
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
- If port 3000 is in use, update the `base_url` environment variable
- If port 3308 (MySQL) is in use, check the docker-compose.yml file

## API Documentation

For detailed API documentation, see:
- `README.md` - General project information
- `API_DOCUMENTATION.md` - Detailed API reference

## Support

If you encounter any issues:
1. Check the application logs
2. Verify the database connection
3. Ensure all environment variables are set correctly
4. Check the API documentation for endpoint requirements
