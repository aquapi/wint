/**
 * A context object for getting the handler
 */
export interface Context {
    /**
     * The request method
     */
    method: string;

    /**
     * The request URL 
     */
    url?: string;

    /**
     * The request path without first `/`
     */
    path?: string;

    /**
     * The pathname start index without first `/` 
     */
    _pathStart?: number;

    /**
     * Pathname end (index of '?' or the end of the URL)
     */
    _pathEnd?: number;

    /**
     * The URL parameters
     */
    params?: any;
}

/**
 * A handler store
 */
export interface Store<T> extends Record<string, Handler<T>> { };

/**
 * A handler
 */
export interface Handler<T> {
    f: T;
}

/**
 * The object for passing between recursive calls
 */
export interface BuildContext {
    /**
     * All store map
     */
    paramsMap: Record<string, any>;

    /**
     * Variable name of the context object
     */
    contextName: string;

    /**
     * The name of the request method variable
     */
    methodName: string;

    /**
     * The name of the path end variable
     */
    pathEndName: string;

    /**
     * The name of the path start variable
     */
    pathStartName: string;

    /**
     * The name of the params variable
     */
    paramsName: string;

    /**
     * The name of the static handlers store
     */
    staticHandlersName: string;

    /**
     * The name of the url variable
     */
    urlName: string;

    /**
     * Substring strategy micro-optimization
     */
    substrStrategy: SubstrStrategy;

    /**
     * The current ID of the store
     */
    currentID: number;
}

/**
 * String substr strategy
 */
export type SubstrStrategy = 'substr' | 'substring' | 'slice';

/**
 * Router option
 */
export interface Options<T> {
    substr?: SubstrStrategy;
    cacheMethod?: boolean;
    contextName?: string;
    staticMap?: StaticMap<T>;
    staticHandlersName?: string;
}

/**
 * Static handlers map
 */
export interface StaticMap<T> extends Record<string, Store<T>> { };

/**
 * Represent a handler
 */
export type Route<T> = [path: string, store: Store<T>];
