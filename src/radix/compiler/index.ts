import { Options } from '../types';
import type { Tree } from '../tree';
import type { BuildContext, MatchFunction } from '../types';
import compileNode from './node';

/**
 * Build a function body to pass into `Function` constructor later
 */
export default <T>(
    tree: Tree<T>,
    options: Options,
): MatchFunction<T> => {
    // Fix missing options 
    options.contextName ??= 'c';
    options.substr ??= 'substring';
    options.matchPath ??= false;

    // Global context
    const ctx: BuildContext = {
        // Path start can be static if a static map is provided
        pathStartName: options.matchPath ? '0' : options.contextName + '._pathStart',
        pathEndName: options.contextName + '.' + (options.matchPath ? 'path.length' : '_pathEnd'),

        urlName: options.contextName + '.' + (options.matchPath ? 'path' : 'url'),
        paramsName: options.contextName + '.params',

        // These props will be changed
        currentID: 0,
        paramsMap: {},

        substrStrategy: options.substr,
        contextName: options.contextName,

        hasPath: options.matchPath
    };

    const content = compileNode(
        tree.root, ctx,
        ctx.pathStartName,
        false, false
    );

    return Function(
        ...Object.keys(ctx.paramsMap),
        `return ${ctx.contextName}=>{${content}return null}`
    )(...Object.values(ctx.paramsMap));
}
