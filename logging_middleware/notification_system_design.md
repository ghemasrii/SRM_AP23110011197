# Logging Middleware Design

## Overview

This repository implements a reusable logging middleware package for the AffordMed logging requirement. The middleware is built in TypeScript under `logging_middleware/` and is consumed by a sample backend service in `notification_app_be/`.

## Goals

- Provide a reusable `Log(stack, level, package, message)` function
- Ensure allowed values are enforced for `stack`, `level`, and `package`
- Send log entries to the test server at `http://20.207.122.201/evaluation-service/logs`
- Support protected route authentication via a bearer token
- Demonstrate the middleware in a backend notification API

## Package contract

### Allowed `stack`
- `backend`
- `frontend`

### Allowed `level`
- `debug`
- `info`
- `warn`
- `error`
- `fatal`

### Allowed backend packages
- `cache`
- `controller`
- `cron_job`
- `db`
- `domain`
- `handler`
- `repository`
- `route`
- `service`

### Allowed frontend packages
- `api`
- `component`
- `hook`
- `page`
- `state`
- `style`

### Allowed shared packages
- `auth`
- `config`
- `middleware`
- `utils`

## Logging middleware implementation

The middleware package is implemented in `logging_middleware/src/index.ts`.

It exposes a single function:

```ts
Log(stack, level, packageName, message, options?)
```

It validates inputs and sends a JSON POST request with the following payload:

```json
{
  "stack": "backend",
  "level": "error",
  "package": "handler",
  "message": "received string, expected bool"
}
```

## Authentication

The logging middleware reads the authorization token from the `LOG_API_TOKEN` environment variable by default. A token can also be passed explicitly via `options.authToken`.

## Sample backend application

The backend app in `notification_app_be/` demonstrates use of the reusable middleware:

- `POST /notify` logs an informational event using `service`
- `POST /notify/error` logs an error event using `handler`

## How to run

1. Install dependencies for both packages.
2. Set `LOG_API_TOKEN` in the environment.
3. Build both packages.
4. Start `notification_app_be`.

## Registration / submission details

- Email: `hemasri_gottumukkala@srmap.edu.in`
- Registration ID: `AP23110011197`
- Access code: `QkbpxH`

## Notes

- The backend package depends on `logging_middleware` via a local file dependency.
- This structure supports extension to frontend or full-stack components later.
