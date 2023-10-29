import { run, bench, group } from 'mitata';
import Memoirist from 'memoirist';
import { Wint, Context } from '..';
import noop from './noop';

// Main
const f1 = { f: () => 'Hi' },
    f2 = { f: () => 'Hello' },
    f3 = { f: () => '{}' };

const wint = Wint.create([
    ['/12345678901234567890', { GET: f1 }],
    ['/id/:id', { GET: f2 }],
    ['/json', { POST: f3 }]
]).build(), memo = new Memoirist;

console.log(wint.find.toString())

memo.add('GET', '/12345678901234567890', f1);
memo.add('GET', '/id/:id', f2);
memo.add('POST', '/json', f3);

// Avoid JIT bias
noop(bench);

group('GET /', () => {
    const c: Context = {
        params: null,
        _pathStart: 1,
        _pathEnd: 20,
        method: 'GET',
        url: '/12345678901234567890'
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
