/// <reference types='bun-types' />
import Wint from '../turbo';
import { test, expect } from 'bun:test';
import register from './register';

const wint = new Wint<string>();
wint.radixOptions.minURLLen = 0;

const router = register(wint);

test('Turbo router', () => {
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
});
