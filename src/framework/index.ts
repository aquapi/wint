import { Options } from '../radix/types';
import Wint, { Matchers } from '../turbo';
import { Context } from './types';

const req = 'req', pathStart = '_pathStart', pathEnd = '_pathEnd', ctx = 'c';

/**
 * Stric-specific API
 */
export const contextMacro = (options: Options) => `let ${pathStart}=${req}.url.indexOf('/',${options.minURLLen ?? 12})+1,`
    + `${pathEnd}=${req}.url.indexOf('?',${pathStart});`
    + `if(${pathEnd}===-1)${pathEnd}=${req}.url.length;`
    + `const ${ctx}={${req},${pathStart},${pathEnd},path:${req}.url.substring(${pathStart},${pathEnd}),headers:{}};`;

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
            + `if(typeof m==='undefined')return f(${fn.length === 0 ? '' : ctx});`
            // Check whether the matcher for the method does exist
            + `${contextMacro(this.radixOptions)}` + `return(m[0][${ctx}.path]??m[1](${ctx})`
        )(fn, matchers);
    }
}

interface FastWint {
    query(c: Request): any;
}

export { FastWint };
export * from './types';
