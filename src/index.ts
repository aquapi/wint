import { Radix } from './radix';
import { Router } from './types';

/**
 * Map by method
 */
export interface Store<T> extends Record<string, T> {
    ALL?: T;
};

/**
 * Basic router. This router supports `ALL` method handler
 */
class Wint<T> {
    /**
     * Internal tree for dynamic path matching
     */
    readonly radix: Radix<Store<T>> = new Radix;

    /**
    * Register a route
    */
    put(method: string, path: string, handler: T) {
        const h = this.radix.tree.store(path, { ALL: null });
        h[method] = handler;
    }

    /**
     * Build the router find function
     */
    build() {
        const find = this.radix.build().find;

        // Plain radix tree match is faster in this case
        this.find = c => {
            var t = find(c);
            return t ? (t[c.method] ?? t.ALL) : null;
        }
    }
}

// Define all method to implement here
interface Wint<T> extends Router<T> { };

export default Wint;
