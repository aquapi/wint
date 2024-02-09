import { getPath } from '../serve';

export const obj = {
    '/': 'Home',
    '/a': 'a',
    '/b': 'b',
    '/c': 'c',
    '/long/path': 'd'
};

export default {
    fetch: (req: Request) => new Response(obj[getPath(req)])
};
