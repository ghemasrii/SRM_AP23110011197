import express, { Request, Response } from 'express';
import { Log } from 'logging-middleware';
import { fetchNotificationsFromTestServer, sortByPriority } from '../services/notificationService';

const router = express.Router();

router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const authToken = process.env.LOG_API_TOKEN;

    if (!authToken) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? Number(limitParam) : undefined;

    await Log('backend', 'info', 'route', 'Fetching notifications from test server');

    const notifications = await fetchNotificationsFromTestServer(authToken);
    const sorted = sortByPriority(notifications, limit);

    await Log(
      'backend',
      'info',
      'service',
      `Retrieved and sorted ${sorted.length} notifications`
    );

    return res.status(200).json({
      count: sorted.length,
      notifications: sorted
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);

    await Log('backend', 'error', 'handler', `Error fetching notifications: ${details}`).catch(
      () => {}
    );

    return res.status(500).json({ error: 'Failed to fetch notifications', details });
  }
});

export default router;
