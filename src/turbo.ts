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
        parsePath: true,
        fallback: null
    };

    /**
     * Radix tree routers for dynamic matching
     */
    readonly trees: Record<string, Radix<T>> = {};

    /**
     * Map by method and pathname
     */
    readonly static: Record<string, Route<T>[]> = {};

    /**
     * Build matcher for validating request
     */
    readonly matchers: Matchers<T> = {};

    /**
     * Register a route
     */
    put<P extends Route<T>[0]>(method: string, path: P, f: Route<T>[1]) {
        // Parametric or wildcard
        if (path.includes('*') || path.includes(':')) {
            if (!(method in this.trees))
                this.trees[method] = new Radix(this.radixOptions);

            // Register the route on the corresponding tree
            this.trees[method].put([path, f]);
        } else {
            if (!(method in this.static))
                this.static[method] = [];

            // Save the path in a record object (normalize later)
            this.static[method].push([path, f]);
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
            caller = this.radixOptions.directCall ? fn : (() => fn) as any,
            doParsePath = this.radixOptions.parsePath;

        // Build matchers
        for (var method in this.static) {
            if (!(method in matchers))
                matchers[method] = [{}, caller];

            // Assign paths
            for (var route of this.static[method])
                matchers[method][0][
                    // Ignore first character because it always matches (not for raw URL match)
                    doParsePath ? route[0].substring(1) : route[0]
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

    buildFinder(matchers: Matchers<T>, parsePath: ReturnType<typeof buildPathParser>) {
        // Build the actual function
        const ctx = this.radixOptions.contextName;

        this.find = Function(
            'f', '_', `return ${ctx}=>{`
            // Search for the matcher
            + `const m=_[${ctx}.method];`
            // Check whether the matcher for the method does exist
            + `if(m){${parsePath.value}return m[0][${parsePath.path}]??m[1](${ctx})}` + `return f}`
        )(this.radixOptions.fallback, matchers);
    }
}

// Add a find function
interface Wint<T> extends Router<T> {
    find(c: Context): T | null;
}

export default Wint;
