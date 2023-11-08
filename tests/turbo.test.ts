/// <reference types='bun-types' />
import Wint from '../turbo';
import { test, expect } from 'bun:test';
import register from './register';

const router = register(new Wint<string>);

test('Turbo router', () => {
    // Root path matching
    expect(router.find({
        method: 'GET',
        url: '',
        _pathStart: 0,
        _pathEnd: 0
    })).toBe('A');

    // Different method
    expect(router.find({
        method: 'POST',
        url: 'json',
        _pathStart: 0,
        _pathEnd: 4
    })).toBe('B');

    // Dynamic path matching
    expect(router.find({
        method: 'GET',
        url: 'id/90',
        _pathStart: 0,
        _pathEnd: 5
    })).toBe('C');

    // Path param first
    expect(router.find({
        method: 'GET',
        url: 'i/account',
        _pathStart: 0,
        _pathEnd: 9
    })).toBe('D');
});
