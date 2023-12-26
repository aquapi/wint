import Wint, { Matchers } from '../turbo';

/**
 * Stric-specific API
 */
export const createContextMacro = (req: string, name: string) =>
    `const _pathStart=${req}.url.indexOf('/',12)+1,`
    + `_pathEnd=${req}.url.indexOf('?',_pathStart),`
    + `${name}={req:${req},_pathStart,_pathEnd,path:_pathEnd===-1?${req}.url.substring(_pathStart):${req}.url.substring(_pathStart,_pathEnd),headers:{}};`;

/**
 * Extract parameters from a path
 */
export type Params<T extends string> = T extends `${infer Segment}/${infer Rest}`
    ? (Segment extends `:${infer Param}`
        ? (Rest extends `*` ? { [K in Param]: string } : { [K in Param]: string } & Params<Rest>)
        : {}) & Params<Rest>
    : T extends `:${infer Param}`
    ? { [K in Param]: string }
    : T extends `*`
    ? { '*': string }
    : {};

export interface AppContext<Path extends string = string> extends ResponseInit {
    /**
     * Raw request object
     */
    req: Request,

    /**
     * Request path
     */
    path: Path;

    /**
     * Request params
     */
    params: Params<Path> & Record<string, string>;
}

/**
 * Router designed specifically for Stric
 */
class FastWint extends Wint<(c: AppContext) => any> {
    constructor() {
        super();
        this.radixOptions.directCall = true;
        this.radixOptions.fallback = () => null;
    }

    buildFinder(matchers: Matchers<(c: AppContext) => any>): void {
        // Build the actual function
        const ctx = this.radixOptions.contextName, fn = this.radixOptions.fallback;

        this.query = Function(
            'f', 't', `return r=>{`
            // Search for the matcher
            + `const m=t[r.method];`
            // Check whether the matcher for the method does exist
            + `if(m){${createContextMacro('r', ctx)}`
            + `return(m[0][${ctx}.path]??m[1])(${ctx})}`
        + `return f(${fn.length === 0 ? '' : ctx})}`
        )(fn, matchers);
    }
}

interface FastWint {
    query(c: Request): any;
}

export { FastWint };

