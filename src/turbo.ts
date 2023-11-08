import { Radix } from './radix';
import buildPathParser from './radix/compiler/utils/buildPathParser';
import { MatchFunction, Options, Route } from './radix/types';
import { Router, Context } from './types';

const noop = () => null;

class Wint<T> {
    /**
     * Radix tree options
     */
    radixOptions: Options = {
        matchPath: true
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
    readonly matchers: Record<string, [Record<string, T>, MatchFunction<T>]> = {};

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
     * Build matchers
     */
    build() {
        const matchers = this.matchers;

        // Build matchers
        for (var method in this.static) {
            if (!(method in matchers))
                matchers[method] = [{}, noop];

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
                matchers[method] = [{}, noop];

            matchers[method][1] = this.trees[method].build().find;
        }

        // Parse path
        const parsePath = buildPathParser(this.radixOptions);

        // Build the actual function
        this.find = c => {
            var matcher = matchers[c.method];

            if (matcher) {
                parsePath(c);
                return matcher[0][c.path] ?? matcher[1](c);
            }

            return null;
        }
        return this;
    }
}

// Add a find function
interface Wint<T> extends Router<T> {
    find(c: Context): T | null;
}

export default Wint;
