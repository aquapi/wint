import { getPath } from '../serve';
import { obj } from './object';

export const map = new Map;
for (const key in obj)
    map.set(key, obj[key]);

export default {
    fetch: (req: Request) => new Response(map.get(getPath(req)))
};
