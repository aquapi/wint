import { Radix } from './radix';
import { Router } from './types';

/**
 * Map by method
 */
export interface Store<T> extends Record<string, T> { };

/**
 * Basic router. This router supports `ALL` method handler
 */
class Wint<T> {
    /**
     * Internal tree for dynamic path matching
     */
    readonly tree: Radix<Store<T>> = new Radix({ matchPath: true });

    /**
     * Static route store
     */
    readonly static: Record<string, Store<T>> = {};
}

// Define all method to implement here
interface Wint<T> extends Router<T> { };

export default Wint;
