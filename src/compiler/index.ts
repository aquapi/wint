import { Options } from '../types';
import type { Tree } from '../tree';
import type { BuildContext, Store } from '../types';
import { method } from './constants';
import compileNode from './node';

/**
 * Build a function body to pass into `Function` constructor later
 */
export default <T>(
    tree: Tree<Store<T>>,
    options: Options<T>,
) => {
    const hasStaticMap = !!options.staticMap,
        ctx: BuildContext = {
            // Path start can be static if a static map is provided
            pathStartName: hasStaticMap ? '0' : options.contextName + '._pathStart',
            pathEndName: options.contextName + (hasStaticMap ? '.path.length' : '._pathEnd'),

            urlName: hasStaticMap ? options.contextName + '.path' : options.contextName + '.url',
            methodName: options.cacheMethod ? method : options.contextName + '.method',
            paramsName: options.contextName + '.params',

            currentID: 0,
            paramsMap: {},

            substrStrategy: options.substr,
            staticHandlersName: options.staticHandlersName,
            contextName: options.contextName,
        };

    // Whether method cache is allowed
    let content = options.cacheMethod ? `var ${method}=${options.contextName}.method;` : '';

    // If static map is available
    if (hasStaticMap) {
        ctx.paramsMap[ctx.staticHandlersName] = options.staticMap;
        content += `if(${ctx.urlName} in ${ctx.staticHandlersName})`
            + `if(${ctx.methodName} in ${ctx.staticHandlersName}[${ctx.urlName}])`
            + `return ${ctx.staticHandlersName}[${ctx.urlName}][${ctx.methodName}];`;
    }

    // Compile 
    content += compileNode(
        tree.root, ctx,
        ctx.pathStartName, false
    ) + 'return null';

    return {
        content,
        meta: ctx
    };
}
