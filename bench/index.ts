import { run, bench, group } from 'mitata';
import noop from './lib/noop';
import { LookupFunctions } from './lib/types';
import setup from './lib/benchCtx';
import handlers from './lib/handlers';

import Wint from './src/Wint';
import Memoirist from './src/Memoirist';
import Radix3 from './src/Radix3';
const lookupFunctions: LookupFunctions = {
    Radix3, Memoirist, Wint
}

// Avoid JIT bias
noop(bench);

// Tests
for (var handler of handlers)
    for (var method in handler[1])
        setup(group, bench, {
            params: null, method,
            url: handler[0]
        }, lookupFunctions);

run();
