import { RegExpRouter } from 'hono/router/reg-exp-router';
import handlers from '../lib/handlers';
import { Lookup } from '../lib/types';

const router = new RegExpRouter();

for (var handler of handlers)
    for (var key in handler[1])
        router.add(key, handler[0], handler[1][key]);

export default (
    (c, path) => () => router.match(c.method, path)
) satisfies Lookup;
