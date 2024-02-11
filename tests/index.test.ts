/// <reference types='bun-types' />
import Wint from '..';
import { test, expect } from 'bun:test';
import register from './register';

test('Basic router', () => {
    const router = register(new Wint<string>);

    // Root path matching
    expect(router.find({
        method: 'GET',
        path: ''
    })).toBe('A');

    // Different method
    expect(router.find({
        method: 'POST',
        path: 'json'
    })).toBe('B');

    // Dynamic path matching
    expect(router.find({
        method: 'GET',
        path: 'id/90'
    })).toBe('C');

    // Path param first
    expect(router.find({
        method: 'GET',
        path: 'i/account'
    })).toBe('D');

    // Null check
    expect(router.find({
        method: 'PUT',
        path: 'a/b'
    })).toBeNil();
});

