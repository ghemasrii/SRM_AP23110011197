"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const http_1 = require("http");
const allowedStacks = new Set(['backend', 'frontend']);
const allowedLevels = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const backendPackages = new Set([
    'cache',
    'controller',
    'cron_job',
    'db',
    'domain',
    'handler',
    'repository',
    'route',
    'service'
]);
const frontendPackages = new Set(['api', 'component', 'hook', 'page', 'state', 'style']);
const sharedPackages = new Set(['auth', 'config', 'middleware', 'utils']);
function validateStack(stack) {
    if (!allowedStacks.has(stack)) {
        throw new Error(`Invalid stack value: ${stack}. Allowed values: backend, frontend.`);
    }
}
function validateLevel(level) {
    if (!allowedLevels.has(level)) {
        throw new Error(`Invalid level value: ${level}. Allowed values: debug, info, warn, error, fatal.`);
    }
}
function validatePackage(packageName) {
    if (!backendPackages.has(packageName) &&
        !frontendPackages.has(packageName) &&
        !sharedPackages.has(packageName)) {
        throw new Error(`Invalid package value: ${packageName}. Allowed backend packages: ${[...backendPackages].join(", ")}; frontend packages: ${[...frontendPackages].join(", ")}; shared packages: ${[...sharedPackages].join(", ")}.`);
    }
}
function sendLogRequest(endpoint, authToken, payload) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);
        const body = JSON.stringify(payload);
        const req = (0, http_1.request)({
            hostname: url.hostname,
            port: Number(url.port) || 80,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                Authorization: `Bearer ${authToken}`
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
                        resolve(parsed);
                    }
                    catch (err) {
                        resolve({ message: 'log request succeeded but response could not be parsed' });
                    }
                }
                else {
                    reject(new Error(`Log API failed with status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
async function Log(stack, level, packageName, message, options = {}) {
    validateStack(stack);
    validateLevel(level);
    validatePackage(packageName);
    const endpoint = options.endpoint ||
        process.env.LOG_API_ENDPOINT ||
        'http://20.207.122.201/evaluation-service/logs';
    const authToken = options.authToken || process.env.LOG_API_TOKEN;
    if (!authToken) {
        throw new Error('Missing authorization token. Provide authToken in options or set LOG_API_TOKEN in environment.');
    }
    const payload = {
        stack,
        level,
        package: packageName,
        message
    };
    return sendLogRequest(endpoint, authToken, payload);
}
