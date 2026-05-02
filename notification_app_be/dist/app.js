"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logging_middleware_1 = require("logging-middleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'notification-app-be', message: 'Notification backend is running' });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'notification-app-be' });
});
app.post('/notify', async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'message is required and must be a string' });
    }
    try {
        await (0, logging_middleware_1.Log)('backend', 'info', 'service', `Notification request received: ${message}`);
        return res.status(200).json({ result: 'notification queued', message });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ error: 'logging failed', details });
    }
});
app.post('/notify/error', async (_req, res) => {
    try {
        await (0, logging_middleware_1.Log)('backend', 'error', 'handler', 'Simulated error from notification handler.');
        res.status(200).json({ result: 'error logged' });
    }
    catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'logging failed', details });
    }
});
exports.default = app;
