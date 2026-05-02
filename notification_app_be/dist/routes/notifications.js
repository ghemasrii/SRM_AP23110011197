"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logging_middleware_1 = require("logging-middleware");
const notificationService_1 = require("../services/notificationService");
const router = express_1.default.Router();
router.get('/notifications', async (req, res) => {
    try {
        const authToken = process.env.LOG_API_TOKEN;
        if (!authToken) {
            return res.status(401).json({ error: 'Missing authorization token' });
        }
        const limitParam = req.query.limit;
        const limit = limitParam ? Number(limitParam) : undefined;
        await (0, logging_middleware_1.Log)('backend', 'info', 'route', 'Fetching notifications from test server');
        const notifications = await (0, notificationService_1.fetchNotificationsFromTestServer)(authToken);
        const sorted = (0, notificationService_1.sortByPriority)(notifications, limit);
        await (0, logging_middleware_1.Log)('backend', 'info', 'service', `Retrieved and sorted ${sorted.length} notifications`);
        return res.status(200).json({
            count: sorted.length,
            notifications: sorted
        });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        await (0, logging_middleware_1.Log)('backend', 'error', 'handler', `Error fetching notifications: ${details}`).catch(() => { });
        return res.status(500).json({ error: 'Failed to fetch notifications', details });
    }
});
exports.default = router;
