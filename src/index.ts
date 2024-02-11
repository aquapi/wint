import { Radix } from './radix';
import { Options } from './radix/types';
import { Router } from './types';

/**
 * Map by method
 */
export interface Store<T> extends Record<string, T> { ALL: T };

/**
 * Basic router. This router supports `ALL` method handler
 */
class Wint<T> {
    /**
     * Internal tree for dynamic path matching
     */
    readonly radix: Radix<Store<T>>;

    /**
     * Create a basic router
     */
    constructor(readonly options: Options = { matchPath: true }) {
        this.radix = new Radix(options);
    }

    put(method: 'ALL', path: string, handler: T): this;

    /**
    * Register a route
    */
    put(method: string, path: string, handler: T): this {
        const h = this.radix.tree.store(path, { ALL: null });
        h[method] = handler;

        return this;
    }

    /**
     * Build the router find function
     */
    build(): this {
        const find = this.radix.build().find;

        this.find = c => {
            const t = find(c);
            return t === null ? null : (t[c.method] ?? t.ALL);
        }

        return this;
    }
}

// Define all method to implement here
interface Wint<T> extends Router<T> { };

export default Wint;

// Internal router API for Stric
import * as t from './framework';
export { t, Radix as Router };
