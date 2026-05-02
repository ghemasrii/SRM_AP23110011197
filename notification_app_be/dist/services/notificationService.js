"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNotificationsFromTestServer = fetchNotificationsFromTestServer;
exports.sortByPriority = sortByPriority;
const NOTIFICATION_PRIORITY = {
    Result: 3,
    Placement: 2,
    Event: 1
};
async function fetchNotificationsFromTestServer(token) {
    return new Promise((resolve, reject) => {
        const { request } = require('http');
        const req = request({
            hostname: '20.207.122.201',
            port: 80,
            path: '/evaluation-service/notifications',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data || '{}');
                        const notifications = parsed.notifications || [];
                        resolve(notifications);
                    }
                    catch (err) {
                        reject(new Error('Failed to parse notifications response'));
                    }
                }
                else {
                    reject(new Error(`Notification API failed with status ${res.statusCode}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}
function sortByPriority(notifications, limit) {
    const sorted = notifications.sort((a, b) => {
        const priorityA = NOTIFICATION_PRIORITY[a.Type] || 0;
        const priorityB = NOTIFICATION_PRIORITY[b.Type] || 0;
        return priorityB - priorityA;
    });
    if (limit && limit > 0) {
        return sorted.slice(0, limit);
    }
    return sorted;
}
