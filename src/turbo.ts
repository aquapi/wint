import { Radix } from './radix';
import buildPathParser from './radix/compiler/utils/buildPathParser';
import { MatchFunction, Options, Route } from './radix/types';
import { Router, Context } from './types';

export interface Matchers<T> extends Record<string, [Record<string, T>, MatchFunction<T>]> { };

class Wint<T> {
    /**
     * Radix tree options
     */
    radixOptions: Options<T> = {
        matchPath: true,
        fallback: null
    };

    /**
     * Radix tree routers for dynamic matching
     */
    readonly trees: Record<string, Radix<T>> = {};

    /**
     * Map by method and pathname
     */
    readonly static: Record<string, [string, T][]> = {};

    /**
     * Build matcher for validating request
     */
    readonly matchers: Matchers<T> = {};

    /**
     * Register a route
     */
    put(method: string, ...route: Route<T>) {
        // Parametric or wildcard
        if (route[0].includes('*') || route[0].includes(':')) {
            if (!(method in this.trees))
                this.trees[method] = new Radix(this.radixOptions);

            // Register the route on the corresponding tree
            this.trees[method].put(route);
        } else {
            if (!(method in this.static))
                this.static[method] = [];

            // Save the path in a record object (normalize later)
            this.static[method].push(route);
        }

        return this;
    }

    /**
     * Set a fallback
     */
    fallback(t: T) {
        this.radixOptions.fallback = t;

        return this;
    }

    /**
     * Build matchers
     */
    build() {
        const matchers = this.matchers,
            // Handle fallback
            fn = this.radixOptions.fallback,
            // For direct call return the fallback directly
            caller = this.radixOptions.directCall ? fn : (() => fn) as any;

        // Build matchers
        for (var method in this.static) {
            if (!(method in matchers))
                matchers[method] = [{}, caller];

            // Assign paths
            for (var route of this.static[method])
                matchers[method][0][
                    // Ignore first character because it always matches
                    route[0].substring(1)
                ] = route[1];
        }

        // Build handlers for trees
        for (var method in this.trees) {
            if (!(method in this.matchers))
                matchers[method] = [{}, null];

            matchers[method][1] = this.trees[method].build().find;
        }

        // Build the find function
        this.buildFinder(
            matchers, buildPathParser(this.radixOptions)
        );

        return this;
    }

    buildFinder(matchers: Matchers<T>, parsePath: string) {
        // Build the actual function
        const ctx = this.radixOptions.contextName;

        this.find = Function(
            'f', '_', `return ${ctx}=>{`
            // Search for the matcher
            + `const m=_[c.method];`
            // Check whether the matcher for the method does exist
            + `if(m){${parsePath}return m[0][${ctx}.path]??m[1](${ctx})}` + `return f}`
        )(this.radixOptions.fallback, matchers);
    }
}

// Add a find function
interface Wint<T> extends Router<T> {
    find(c: Context): T | null;
}

/**
 * Direct call
 */
class FastWint<T> extends Wint<(c: Context) => T> {
    constructor() {
        super();
        this.radixOptions.directCall = true;
        this.radixOptions.fallback = () => null;
    }

    buildFinder(matchers: Matchers<(c: Context) => T>, parsePath: string): void {
        // Build the actual function
        const ctx = this.radixOptions.contextName, fn = this.radixOptions.fallback;

        this.query = Function(
            'f', 't', `return ${ctx}=>{`
            // Search for the matcher
            + `const m=t[c.method];`
            // Check whether the matcher for the method does exist
            + `if(m){${parsePath}return(m[0][${ctx}.path]??m[1])(${ctx})}` + `return f(${fn.length === 0 ? '' : ctx})}`
        )(fn, matchers);
    }
}

interface FastWint<T> {
    query(c: Context): T;
}

export { FastWint };
export default Wint;
