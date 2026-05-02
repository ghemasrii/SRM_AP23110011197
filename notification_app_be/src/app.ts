import express from 'express';
import cors from 'cors';
import { Log } from 'logging-middleware';
import notificationsRouter from './routes/notifications';

const app = express();
process.env.LOG_API_TOKEN = process.env.LOG_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZW1hc3JpX2dvdHR1bXVra2FsYUBzcm1hcC5lZHUuaW4iLCJleHAiOjE3Nzc3MDkwNzksImlhdCI6MTc3NzcwODE3OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImQxOTYyOWU3LTU2MWUtNDY5ZC1hZWMyLThjYTA4ZjM1Y2JiNSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImdvdHR1bXVra2FsYSBoZW1hIHNyaSIsInN1YiI6ImYzMWI3N2ZhLTg5YzUtNGEyYi05MDJmLTljODdmYjhhODMxMyJ9LCJlbWFpbCI6ImhlbWFzcmlfZ290dHVtdWtrYWxhQHNybWFwLmVkdS5pbiIsIm5hbWUiOiJnb3R0dW11a2thbGEgaGVtYSBzcmkiLCJyb2xsTm8iOiJhcDIzMTEwMDExMTk3IiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiZjMxYjc3ZmEtODljNS00YTJiLTkwMmYtOWM4N2ZiOGE4MzEzIiwiY2xpZW50U2VjcmV0IjoicHduTmNFWlV0Y05TbWJCRyJ9.8bPcgpbL3XHfpKExU7hzhR-Rxxi2hXx_te4MD8qn4p4';
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
