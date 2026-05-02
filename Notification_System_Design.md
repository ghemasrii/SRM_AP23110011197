# Notification System Design

## Stage 1: Campus Notifications Microservice - Backend

This document describes the architecture and implementation of the Campus Notifications Microservice, focusing on the backend API for fetching and prioritizing notifications.

### Overview

The Campus Notifications Microservice provides a real-time notification system for campus events, including placements, results, and general announcements. This is **Stage 1**, which focuses on building the backend API for fetching notifications from the test server and prioritizing them based on type.

### Goals

- Fetch notifications from the AffordMed test server
- Prioritize notifications by type (Result > Placement > Event)
- Support query parameters for limiting the number of notifications
- Integrate with the logging middleware for observability
- Prepare infrastructure for Stage 2 (React/Next frontend)

### Architecture

#### Components

1. **Logging Middleware** (`logging_middleware/`)
   - Reusable logging package for both backend and frontend
   - Sends logs to `http://20.207.122.201/evaluation-service/logs`
   - Enforces strict validation of stack, level, and package types

2. **Notification Backend** (`notification_app_be/`)
   - Express server running on `http://localhost:3000` (or next available port)
   - Fetches notifications from test API
   - Applies priority sorting before returning to clients

#### API Endpoints

##### GET /notifications

Fetches all notifications from the test server and returns them sorted by priority.

**Query Parameters:**
- `limit` (optional): Maximum number of notifications to return

**Example:**
```
GET http://localhost:3000/notifications?limit=10
```

**Response (Status 200):**
```json
{
  "count": 3,
  "notifications": [
    {
      "ID": "d16295a-d086-4a34-9e69-398ea14576bc",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:51:30"
    },
    {
      "ID": "b282218f-ea5a-4b7c-9389-1f2f240d64be",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-21 17:51:18"
    },
    {
      "ID": "51593ada-0ad3-4f77-9554-f52f658e85d9",
      "Type": "Event",
      "Message": "farewell",
      "Timestamp": "2026-04-22 17:51:06"
    }
  ]
}
```

**Error Response (Status 401):**
```json
{
  "error": "Missing authorization token"
}
```

**Error Response (Status 500):**
```json
{
  "error": "Failed to fetch notifications",
  "details": "Network error or server unreachable"
}
```

### Notification Priority

Notifications are prioritized by type:

1. **Result** (Priority 3) — Academic results, exam marks
2. **Placement** (Priority 2) — Placement news, job offers
3. **Event** (Priority 1) — General campus events

When you call `/notifications`, the backend sorts by priority and returns the highest-priority notifications first. If you provide a `limit` query parameter, only the top N notifications are returned.

### Implementation Details

#### Notification Service (`src/services/notificationService.ts`)

- `fetchNotificationsFromTestServer(token)`: Makes HTTP request to test server API
- `sortByPriority(notifications, limit)`: Sorts by type priority and applies limit

#### Notifications Route (`src/routes/notifications.ts`)

- Implements `GET /notifications` endpoint
- Validates authorization token
- Calls notification service
- Logs all operations using the logging middleware
- Returns error responses for failures

### Environment Variables

- `LOG_API_TOKEN`: Bearer token for the logging API (required)
- `PORT`: Port to run the backend on (default: 3000)

If the primary port is busy, the backend automatically tries the next available port.

### How to Run

1. Set the authorization token:
   ```powershell
   $env:LOG_API_TOKEN = "your_token_here"
   ```

2. Build:
   ```powershell
   cd logging_middleware && npm run build
   cd ../notification_app_be && npm run build
   ```

3. Start the backend:
   ```powershell
   cd notification_app_be
   npm start
   ```

4. Test the endpoint:
   ```powershell
   curl.exe http://localhost:3000/notifications
   ```

### Logging

The backend logs all operations using the middleware:

- **Info logs**: When the endpoint is called and notifications are retrieved
- **Error logs**: When the notification API fails or network errors occur

All logs are sent to the protected test server endpoint `http://20.207.122.201/evaluation-service/logs`.

### Stage 2 Preview

Stage 2 will add a React/Next frontend running on `http://localhost:3000` that:
- Displays all notifications from the backend API
- Shows limited notifications (configurable top N) on a dashboard
- Implements filtering by notification type
- Includes mobile-responsive design using Material UI or vanilla CSS

## Registration Details

- **Email**: hemasri_gottumukkala@srmap.edu.in
- **Registration ID**: AP23110011197
- **Access Code**: QkbpxH

## Key Constraints & Requirements

- Use Node.js + TypeScript for the backend
- Do not store notifications in a database
- Do not hard-code notifications
- Use the provided test API endpoint
- Submit code to the GitHub repository
- Include screenshots of API responses
- Push all changes regularly to GitHub
