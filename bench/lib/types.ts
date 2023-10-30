import { Context } from '../..';

export interface Lookup {
    (c: Context, normalPath: string): () => any;
}

export interface LookupFunctions extends Record<string, Lookup> { };
