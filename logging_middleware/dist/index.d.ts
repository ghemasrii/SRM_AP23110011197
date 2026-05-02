export type Stack = 'backend' | 'frontend';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
export type PackageName = BackendPackage | FrontendPackage | SharedPackage;
export interface LogOptions {
    authToken?: string;
    endpoint?: string;
}
export interface LogResponse {
    logID?: string;
    message: string;
}
export declare function Log(stack: Stack, level: Level, packageName: PackageName, message: string, options?: LogOptions): Promise<LogResponse>;
