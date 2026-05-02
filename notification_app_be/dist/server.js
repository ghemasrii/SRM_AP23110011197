"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const basePort = process.env.PORT ? Number(process.env.PORT) : 3000;
function startServer(port) {
    const server = app_1.default.listen(port, () => {
        console.log(`notification-app-be running on http://localhost:${port}`);
    });
    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            const nextPort = port + 1;
            console.warn(`Port ${port} is already in use. Trying port ${nextPort} instead...`);
            startServer(nextPort);
        }
        else if (err instanceof Error) {
            console.error('Server failed to start:', err.message);
            process.exit(1);
        }
        else {
            console.error('Server failed to start:', err);
            process.exit(1);
        }
    });
}
startServer(basePort);
