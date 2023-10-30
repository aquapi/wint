import Memoirist from 'memoirist';
import handlers from '../lib/handlers';
import { Lookup } from '../lib/types';

const memo = new Memoirist;

for (var handler of handlers)
    for (var key in handler[1])
        memo.add(key, handler[0], handler[1][key]);

export default (
    (c, path) => () => memo.find(c.method, path)
) satisfies Lookup;
