import { run, bench, group } from 'mitata';
import { Router as RadixRouter } from '..';
import { Router as SplitRouter } from '../lib/split';
import assert from 'assert';

// Avoid JIT bias
for (let i = 0; i < 50; ++i)
    bench('noop', () => { });

// Preparation
const path = '/long/static/:path/that/includes/a/:wildcard/*';

const radix = new RadixRouter<number>({
    matchPath: true,
    parsePath: false
})
    .put([path, 1])
    .build().find;

const split = new SplitRouter<number>()
    .put(path, 1)
    .build().find;

const ctx = {
    path: '/long/static/path/that/includes/a/wildcard/and/others'
};

// Debug
assert(radix(ctx) === split(ctx));

console.log('Radix:', radix.toString());
console.log('Split:', split.toString());

// Benchmark
group('Base router', () => {
    bench('Radix', () => {
        radix(ctx);
    });

    bench('Split', () => {
        split(ctx);
    });
});

run();
