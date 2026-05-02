import { Log } from 'logging-middleware';

export interface Notification {
  ID: string;
  Type: 'Result' | 'Placement' | 'Event';
  Message: string;
  Timestamp: string;
}

const NOTIFICATION_PRIORITY: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1
};

export async function fetchNotificationsFromTestServer(
  token: string,
  params: { limit?: number; page?: number; notification_type?: string } = {}
): Promise<Notification[]> {
  return new Promise((resolve, reject) => {
    const { request } = require('http');

    let path = '/evaluation-service/notifications';
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.notification_type) query.append('notification_type', params.notification_type);
    
    if (query.toString()) {
      path += `?${query.toString()}`;
    }

    const req = request(
      {
        hostname: '20.207.122.201',
        port: 80,
        path: path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      (res: any) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data || '{}');
              const notifications: Notification[] = parsed.notifications || [];
              resolve(notifications);
            } catch (err) {
              reject(new Error('Failed to parse notifications response'));
            }
          } else {
            reject(new Error(`Notification API failed with status ${res.statusCode}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

export function sortByPriority(
  notifications: Notification[],
  limit?: number
): Notification[] {
  const sorted = [...notifications].sort((a, b) => {
    const priorityA = NOTIFICATION_PRIORITY[a.Type] || 0;
    const priorityB = NOTIFICATION_PRIORITY[b.Type] || 0;

    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    // Secondary sort: Recency (Timestamp desc)
    return b.Timestamp.localeCompare(a.Timestamp);
  });

  if (limit && limit > 0) {
    return sorted.slice(0, limit);
  }

  return sorted;
}
