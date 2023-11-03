import compile from './compiler';
import { Tree } from './tree';
import type { Context, Options, Route } from './types';

export class Radix<T> {
    /**
     * The DS
     */
    readonly tree: Tree<T> = new Tree;

    /**
     * Create a radix tree router
     */
    constructor(public readonly options: Options = {}) { }

    /**
     * Register routes
     */
    routes(routes: Route<T>[]) {
        for (var route of routes)
            this.tree.store(route[0], route[1]);

        return this;
    }

    /**
     * Register a route
     */
    put(route: Route<T>) {
        this.tree.store(route[0], route[1]);

        return this;
    }

    /**
     * Create and register routes
     */
    static create<T>(routes: Route<T>[]) {
        return new this<T>().routes(routes);
    }

    /**
     * Build a find function
     */
    build() {
        this.find = compile(this.tree, this.options);
        return this;
    }
}

export interface Radix<T> {
    find(c: Context): T;
};
