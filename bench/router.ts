import { run, bench, group } from 'mitata';
import Memoirist from 'memoirist';
import { Wint, Context } from '..';

// Main 
const f1 = { f: () => 'Hi' },
    f2 = { f: () => 'Hello' },
    f3 = { f: () => '{}' };

const wint = Wint.create([
    ['/', { GET: f1 }],
    ['/id/:id', { GET: f2 }],
    ['/json', { POST: f3 }]
]).build(), memo = new Memoirist;

console.log(wint.find.toString())

memo.add('GET', '/', f1);
memo.add('GET', '/id/:id', f2);
memo.add('POST', '/json', f3);

// Avoid JIT bias
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });
bench('noop', () => { });

group('GET /', () => {
    const c: Context = {
        params: null,
        _pathStart: 1,
        _pathEnd: 1,
        method: 'GET',
        url: '/'
    };

    bench('Memoirist', () => memo.find(c.method, c.url));
    bench('Wint', () => wint.find(c));
});

group('GET /id/:id', () => {
    const c: Context = {
        params: null,
        _pathStart: 1,
        _pathEnd: 6,
        method: 'GET',
        url: '/id/90'
    };

    bench('Memoirist', () => memo.find(c.method, c.url));
    bench('Wint', () => wint.find(c));
});

group('POST /json', () => {
    const c: Context = {
        params: null,
        _pathStart: 1,
        _pathEnd: 5,
        method: 'POST',
        url: '/json'
    };

    bench('Memoirist', () => memo.find(c.method, c.url));
    bench('Wint', () => wint.find(c));
});

run();
