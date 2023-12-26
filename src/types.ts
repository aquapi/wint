import { Context, Route } from './radix/types';

export interface Router<T> {
    /**
     * Add a route handler
     */
    put(method: string, ...route: Route<T>): this;
    /**
     * Find the matching item
     */
    find(c: Partial<Context>): T | null;

    /**
     * Build the router handler
     */
    build(): this;
}

export { Context };
