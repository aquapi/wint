import compile from './compiler';
import { Tree } from './tree';
import type { Options, Route, Context } from './types';

export class Wint<T> {
    /**
     * The DS
     */
    readonly tree: Tree<T> = new Tree;

    /**
     * Router options
     */
    readonly options: Options = {
        substr: 'substring',
        contextName: 'c'
    };

    /**
     * Register routes
     */
    routes(routes: Route<T>[]) {
        for (var route of routes)
            this.tree.store(route[0], route[1]);

        return this;
    }

    /**
     * Create and register routes
     */
    static create<T>(routes: Route<T>[]) {
        return new Wint<T>().routes(routes);
    }

    /**
     * Build a find function
     */
    build() {
        this.find = compile(this.tree, this.options);
        return this;
    }
}

export interface Wint<T> {
    /**
     * Find a handler based on the given context
     */
    find(c: Context): T;
}

export * as compile from './compiler';
export * as compileNode from './compiler/node';
export * as constants from './compiler/constants';
export * from './types';
