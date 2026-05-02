import { request } from 'http';

export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
export type PackageName = BackendPackage | FrontendPackage | SharedPackage;

const allowedStacks = new Set<Stack>(['backend', 'frontend']);
const allowedLevels = new Set<Level>(['debug', 'info', 'warn', 'error', 'fatal']);
const backendPackages = new Set<BackendPackage>([
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
const frontendPackages = new Set<FrontendPackage>(['api', 'component', 'hook', 'page', 'state', 'style']);
const sharedPackages = new Set<SharedPackage>(['auth', 'config', 'middleware', 'utils']);

export interface LogOptions {
  authToken?: string;
  endpoint?: string;
}

export interface LogResponse {
  logID?: string;
  message: string;
}

function validateStack(stack: string): asserts stack is Stack {
  if (!allowedStacks.has(stack as Stack)) {
    throw new Error(`Invalid stack value: ${stack}. Allowed values: backend, frontend.`);
  }
}

function validateLevel(level: string): asserts level is Level {
  if (!allowedLevels.has(level as Level)) {
    throw new Error(
      `Invalid level value: ${level}. Allowed values: debug, info, warn, error, fatal.`
    );
  }
}

function validatePackage(packageName: string): asserts packageName is PackageName {
  if (
    !backendPackages.has(packageName as BackendPackage) &&
    !frontendPackages.has(packageName as FrontendPackage) &&
    !sharedPackages.has(packageName as SharedPackage)
  ) {
    throw new Error(
      `Invalid package value: ${packageName}. Allowed backend packages: ${[...backendPackages].join(", ")}; frontend packages: ${[...frontendPackages].join(", ")}; shared packages: ${[...sharedPackages].join(", ")}.`
    );
  }
}

function sendLogRequest(
  endpoint: string,
  authToken: string,
  payload: Record<string, unknown>
): Promise<LogResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const body = JSON.stringify(payload);
    const req = request(
      {
        hostname: url.hostname,
        port: Number(url.port) || 80,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: `Bearer ${authToken}`
        }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data || '{}');
              resolve(parsed as LogResponse);
            } catch (err) {
              resolve({ message: 'log request succeeded but response could not be parsed' });
            }
          } else {
            reject(new Error(`Log API failed with status ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function Log(
  stack: Stack,
  level: Level,
  packageName: PackageName,
  message: string,
  options: LogOptions = {}
): Promise<LogResponse> {
  validateStack(stack);
  validateLevel(level);
  validatePackage(packageName);

  const endpoint =
    options.endpoint ||
    process.env.LOG_API_ENDPOINT ||
    'http://20.207.122.201/evaluation-service/logs';
  const authToken = options.authToken || process.env.LOG_API_TOKEN;

  if (!authToken) {
    throw new Error(
      'Missing authorization token. Provide authToken in options or set LOG_API_TOKEN in environment.'
    );
  }

  const payload = {
    stack,
    level,
    package: packageName,
    message
  };

  return sendLogRequest(endpoint, authToken, payload);
}
