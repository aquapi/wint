import Wint, { Matchers } from '../turbo';
import { Context } from './types';

const req = 'req', pathStart = '_pathStart', pathEnd = '_pathEnd', ctx = 'c';

/**
 * Stric-specific API
 */
export const createContextMacro = () =>
    `const ${pathStart}=${req}.url.indexOf('/',12)+1,`
    + `${pathEnd}=${req}.url.indexOf('?',${pathStart}),`
    + `${ctx}={${req},${pathStart},${pathEnd},path:${pathEnd}===-1?${req}.url.substring(${pathStart}):${req}.url.substring(${pathStart},${pathEnd}),headers:{},state:{}};`;

/**
 * Router designed specifically for Stric
 */
class FastWint extends Wint<(c: Context) => any> {
    constructor() {
        super();
        this.radixOptions.directCall = true;
        this.radixOptions.fallback = () => null;
    }

    buildFinder(matchers: Matchers<(c: Context) => any>): void {
        // Build the actual function
        const fn = this.radixOptions.fallback;

        this.query = Function(
            'f', 't', `return ${req}=>{`
            // Search for the matcher
            + `const m=t[${req}.method];`
            // Check whether the matcher for the method does exist
            + `if(m){${createContextMacro()}`
            + `return(m[0][${ctx}.path]??m[1])(${ctx})}`
        + `return f(${fn.length === 0 ? '' : ctx})}`
        )(fn, matchers);
    }
}

interface FastWint {
    query(c: Request): any;
}

export { FastWint };
export * from './types';
