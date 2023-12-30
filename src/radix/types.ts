/**
 * A context object for getting the handler
 */
export interface Context {
    /**
     * Parsed pathname 
     */
    path: string;

    /**
     * The request URL
     */
    url: string;

    /**
     * The pathname start index
     */
    _pathStart: number;

    /**
     * Pathname end index (index of '?' or the end of the URL)
     */
    _pathEnd: number;

    /**
     * The URL parameters
     */
    params: any;

    /**
     * The method name
     */
    method: string;
}

/**
 * The object for passing between recursive calls
 */
export interface BuildContext {
    /**
     * All store map
     */
    readonly paramsMap: Record<string, any>;

    /**
     * Variable name of the context object
     */
    readonly contextName: string;

    /**
     * The name of the path end variable
     */
    readonly pathEndName: string;

    /**
     * The name of the path start variable
     */
    readonly pathStartName: string;

    /**
     * The name of the params variable
     */
    readonly paramsName: string;

    /**
     * The name of the url variable
     */
    readonly urlName: string;

    /**
     * Substring strategy micro-optimization
     */
    readonly substrStrategy: SubstrStrategy;

    /**
     * If the path name is already parsed
     */
    readonly hasPath: boolean;

    /**
     * Call arguments
     */
    readonly caller: string;

    /**
     * Fallback variable or null
     */
    readonly fallback: string;

    /**
     * The current ID of the store
     */
    currentID: number;
}

/**
 * String substr strategy
 */
export type SubstrStrategy = 'substring' | 'slice';

/**
 * Router option
 */
export interface Options<T = any> {
    substr?: SubstrStrategy;
    contextName?: string;
    /**
     * Whether to match using c.path or c.url
     */
    matchPath?: boolean;
    /**
     * Index of
     */
    minURLLen?: number;
    directCall?: boolean;
    fallback?: T | null;
    /**
     * Start index for URL matching
     */
    pathStart?: number;
    /**
     * Set this to false to remove path parsing even when path is not provided (use c.url)
     */
    parsePath?: boolean;
}

/**
 * Represent a handler
 */
export type Route<T> = [path: string, store: T];

/**
 * A match function
 */
export interface MatchFunction<T, C = Context> {
    (c: C): T | null;
}
