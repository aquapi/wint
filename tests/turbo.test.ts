/// <reference types='bun-types' />
import { FastWint } from '../turbo';
import { test, expect } from 'bun:test';
import register from './register';

const wint = new FastWint<string>();
wint.radixOptions.minURLLen = 0;

const router = register(wint, true);
console.log(router.query.toString())

test('Turbo router', () => {
    // Root path matching
    expect(router.query({
        method: 'GET',
        url: '/',
    })).toBe('A');

    // Different method
    expect(router.query({
        method: 'POST',
        url: '/json',
    })).toBe('B');

    // Dynamic path matching
    expect(router.query({
        method: 'GET',
        url: '/id/90'
    })).toBe('C');

    // Path param first
    expect(router.query({
        method: 'GET',
        url: '/i/account',
    })).toBe('D');
});
