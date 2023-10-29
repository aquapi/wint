import compile from './compiler';

import { Tree } from './tree';
import type { Options, Route, Store, Handler, Context } from './types';

export class Wint<T> {
    /**
     * The DS
     */
    readonly tree: Tree<Store<T>> = new Tree;

    /**
     * Record of routes
     */
    readonly record: Route<T>[] = [];

    /**
     * Router options
     */
    readonly options: Options = { substr: 'substring' };

    /**
     * Register routes
     */
    routes(routes: Route<T>[]) {
        this.record.push(...routes);

        return this;
    }

    /**
     * Create and register routes
     */
    static create<T>(routes: Route<T>[]) {
        return new Wint<T>().routes(routes);
    }

    /**
     * Inspect the output string
     */
    inspect(ctxName: string = 'c') {
        return compile(this.tree, ctxName, this.options.substr);
    }

    /**
     * Build a find function
     */
    build() {
        for (var route of this.record)
            this.tree.store(route[0], route[1]);

        const c = compile(this.tree, 'c', this.options.substr),
            keys = [], values = [];

        for (var key in c.meta.paramsMap) {
            keys.push(key);
            values.push(c.meta.paramsMap[key]);
        }

        this.find = Function(...keys, `return c=>{${c.content}}`)(...values);
        return this;
    }
}

export interface Wint<T> {
    /**
     * Find a handler based on the given context
     */
    find(c: Context): Handler<T>;
}

export * as compile from './compiler';
export * as compileNode from './compiler/node';
export * as constants from './compiler/constants';
export * from './types';
