import express from 'express';
import cors from 'cors';
import { Log } from 'logging-middleware';
import notificationsRouter from './routes/notifications';

const app = express();
process.env.LOG_API_TOKEN = process.env.LOG_API_TOKEN || 'eyJhb6ci0iJIUZIlNiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNTc0MzQOL CJpYXQ10jE3NDM1NzQwNDQsImlzcyI6IkFmZm9yZG11ZCIsImp@aSI6ImQ5Y2JiNjk5LTZhMjctNDRh NS04ZDUSLTHIMW31ZmE4MTZKYSIsInN1YiI6InJhbWtyaXNobmFAYWJjLmVkdSJ9LCJ1bWFpbCI6InJ hbWtyaXNobmFAYWJjLmVkdSIsIm5hbkUiOiJyYW@ga3Jpc2huYSIsInJvbGxObyI6ImFhMWJiliwiYw NjZXNzQ29kZSI6InhnQXNOQyIsImNsaWVudElEIjoiZDljYmI2OTktNmEyNy00NGE1LThkNTktOGIXY mVmYTgxNmRhIiwiY2xpZW50U2VjcmV0IjoidFZKYWFhUkJTZVhjU1h1TSJ9.YAp098gqOIN_0ww7JMf muUfK1m4hLTm7AICLDCLAzVg';
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-app-be', message: 'Notification backend is running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-app-be' });
});

app.use(notificationsRouter);

app.post('/notify', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required and must be a string' });
  }

  try {
    await Log('backend', 'info', 'service', `Notification request received: ${message}`);
    return res.status(200).json({ result: 'notification queued', message });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: 'logging failed', details });
  }
});

app.post('/notify/error', async (_req, res) => {
  try {
    await Log('backend', 'error', 'handler', 'Simulated error from notification handler.');
    res.status(200).json({ result: 'error logged' });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'logging failed', details });
  }
});

export default app;
