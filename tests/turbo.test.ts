/// <reference types='bun-types' />
import Wint from '../lib/turbo';
import { test, expect } from 'bun:test';
import register from './register';

test('Turbo router', () => {
    const wint = new Wint<string>().fallback('E');
    wint.radixOptions.minURLLen = 0;

    const router = register(wint);
    console.log(router.find.toString());

    // Root path matching
    expect(router.find({
        method: 'GET',
        url: '/',
    })).toBe('A');

    // Different method
    expect(router.find({
        method: 'POST',
        url: '/json',
    })).toBe('B');

    // Dynamic path matching
    expect(router.find({
        method: 'GET',
        url: '/id/90'
    })).toBe('C');

    // Path param first
    expect(router.find({
        method: 'GET',
        url: '/i/account',
    })).toBe('D');

    // Path param first
    expect(router.find({
        method: 'GET',
        url: '/json',
    })).toBe('E');
});
