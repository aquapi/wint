/**
 * A context object for getting the handler
 */
export interface Context {
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
    params?: any;
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
export interface Options {
    substr?: SubstrStrategy;
    contextName?: string;
}

/**
 * Represent a handler
 */
export type Route<T> = [path: string, store: T];
