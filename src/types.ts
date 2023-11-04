import { Context as RadixContext, Route } from './radix/types';

export interface Context extends RadixContext {
    /**
     * The request method
     */
    method: string;

    /**
     * The request path
     */
    path?: string;
};

export interface Router<T> {
    /**
     * Add a route handler
     */
    put(method: string, ...route: Route<T>): this;
    /**
     * Find the matching item
     */
    find(c: Context): T | null;

    /**
     * Build the router handler
     */
    build(): this;
}

