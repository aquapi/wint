import { Context } from './radix/types';

export interface WintContext extends Context {
    /**
     * The request method
     */
    method: string;

    /**
     * The request path
     */
    path: string;
};
