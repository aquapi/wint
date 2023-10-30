import { run, bench, group } from 'mitata';
import Memoirist from 'memoirist';
import { Wint, Context } from '../src';
import noop from './noop';
import { createRouter } from 'radix3';

// Main
const f1 = { f: () => 'Hi' },
    f2 = { f: () => 'Hello' },
    f3 = { f: () => '{}' },
    path1 = '/1234567/8901234567890',
    path2 = '/id/:id',
    path2Test = '/id/90',
    path3 = '/json';

// Wint
const wint = Wint.create([
    [path1, { GET: f1 }],
    [path2, { GET: f2 }],
    [path3, { POST: f3 }]
]);

// Enable static map 
// wint.options.staticMap = {};
wint.build();

console.log(wint.find.toString());

// Memoirist
const memo = new Memoirist;
memo.add('GET', path1, f1);
memo.add('GET', path2, f2);
memo.add('POST', path3, f3);

// Radix3
const radix3 = createRouter({
    routes: {
        [path1]: { GET: f1 },
        [path2]: { GET: f2 },
        [path3]: { POST: f3 }
    }
}), radix3Lookup = (method: string, path: string) => {
    const t = radix3.lookup(path);
    return t === null ? null : (
        method in t ? t[method] : null
    );
};

function benchCtx(c: Context) {
    const hasPath = !!c.path,
        normalPath = hasPath ? c.path! : c.url!,
        label = c.method + ' ' + normalPath;

    // Normalize path for Wint
    if (hasPath)
        c.path = c.path!.substring(1);
    else {
        c._pathStart = 1;
        c._pathEnd = c.url!.length
    }

    // Print search result before running tests
    console.log('----', label, '----');
    console.log('Wint:', wint.find(c));
    console.log('Memoirist:', memo.find(c.method, normalPath));
    console.log('Radix3:', radix3Lookup(c.method, normalPath));
    console.log();

    // Main bench
    group(label, () => {
        bench('Radix3', () => radix3Lookup(c.method, normalPath));
        bench('Memoirist', () => memo.find(c.method, normalPath));
        bench('Wint', () => wint.find(c));
    });
}

// Avoid JIT bias
noop(bench);

benchCtx({
    params: null,
    method: 'GET',
    url: path1
});

benchCtx({
    params: null,
    method: 'GET',
    url: path2Test
});

benchCtx({
    params: null,
    method: 'POST',
    url: path3
});

run();
