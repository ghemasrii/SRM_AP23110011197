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
    const pageParam = req.query.page as string | undefined;
    const typeParam = req.query.notification_type as string | undefined;

    const limit = limitParam ? Number(limitParam) : undefined;
    const page = pageParam ? Number(pageParam) : undefined;

    await Log('backend', 'info', 'controller', `Fetching notifications (limit=${limit}, page=${page}, type=${typeParam})`);

    const notifications = await fetchNotificationsFromTestServer(authToken, {
      limit,
      page,
      notification_type: typeParam
    });
    
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
