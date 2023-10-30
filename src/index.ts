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
    readonly options: Options<T> = {
        substr: 'substring',
        cacheMethod: false,
        contextName: 'c',
        staticMap: null,
        staticHandlersName: '_h'
    };

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
    inspect() {
        return compile(this.tree, this.options);
    }

    /**
     * Build a find function
     */
    build() {
        // Fix missing options
        this.options.contextName ??= 'c';
        this.options.substr ??= 'substring';
        this.options.staticHandlersName ??= '_h';

        // Add all to the tree and compile
        let route: Route<T>;
        if (this.options.staticMap)
            for (route of this.record) {
                if (route[0].includes(':') || route[0].includes('*'))
                    this.tree.store(route[0], route[1]);
                else
                    this.options.staticMap[route[0].substring(1)] = route[1];
            }
        else for (route of this.record)
            this.tree.store(route[0], route[1]);

        const c = compile(
            this.tree, this.options
        ), keys = [], values = [];

        // Add to the function scope
        for (var key in c.meta.paramsMap) {
            keys.push(key);
            values.push(c.meta.paramsMap[key]);
        }

        this.find = Function(...keys, `return ${this.options.contextName}=>{${c.content}}`)(...values);
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
