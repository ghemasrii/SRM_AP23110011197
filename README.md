# AffordMed Logging Middleware and Notification Backend

This repository contains a reusable logging middleware package and a sample backend application.

## Structure

- `logging_middleware/` — reusable TypeScript logging package
- `notification_app_be/` — Express backend demonstrating middleware usage

## How to run

1. Set `LOG_API_TOKEN` in your environment.
2. Install dependencies:
   - `cd logging_middleware && npm install`
   - `cd ../notification_app_be && npm install`
3. Build both packages:
   - `npm run build`
4. Start the backend app:
   - `cd notification_app_be && npm start`

If port `3000` is already in use, start with another port:

```powershell
$env:PORT = "3001"
npm start
```

## Registration / submission details

- Email: `hemasri_gottumukkala@srmap.edu.in`
- Registration ID: `AP23110011197`
- Access code: `QkbpxH`

## Sample endpoints

- `GET /health`
- `POST /notify` — logs an informational backend event
- `POST /notify/error` — logs an error event

## Notes

The logging middleware sends protected logs to the configured test server endpoint at `http://20.207.122.201/evaluation-service/logs`.
