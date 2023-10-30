import { createRouter } from 'radix3';
import handlers from '../lib/handlers';
import { Lookup } from '../lib/types';

const routes = {};
for (var handler of handlers)
    routes[handler[0]] = handler[1];

const router = createRouter({ routes }),
    lookup = (method: string, path: string) => {
        const t = router.lookup(path);
        return t === null ? null : (
            method in t ? t[method] : null
        );
    };

export default (
    (c, path) => () => lookup(c.method, path)
) satisfies Lookup;
