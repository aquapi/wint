/// <reference types='bun-types' />
export const
    host = 'http://localhost:3000',
    hostLen = host.length,
    getPath = (req: Request): string => req.url.substring(hostLen);
