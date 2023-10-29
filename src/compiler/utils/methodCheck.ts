import { BuildContext, Handler, Store } from '../../types';
import insertStore from './insertStore';

export default <T>(
    // res is the condition
    res: string | null, store: Store<T>,
    ctx: BuildContext<Handler<T>>,
    preReturn: string | null,
) => {
    const keys = Object.keys(store), noPreRet = preReturn === null;

    // Optimization: Inline into the condition
    if (keys.length === 1)
        return `if(${res === null ? '' : res + '&&'}${ctx.methodName}==='${keys[0]}')`
            + (noPreRet ? '' : '{' + preReturn + ';')
            + `return ${insertStore(ctx, store[keys[0]])}`
            + (noPreRet ? ';' : '}');

    // Use a switch statement
    res = `${res ? 'if(' + res + ')' : ''}switch(${ctx.methodName}){`

    // Add a case statement for each method
    let method: string;
    for (method of keys)
        res += `case'${method}':return ${insertStore(ctx, store[method])};`;

    return res + '}';
}
