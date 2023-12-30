import { Options } from '../types';
import type { Tree } from '../tree';
import type { MatchFunction } from '../types';
import compileNode from './node';
import createContext from './utils/createContext';
import { fallback } from './constants';

/**
 * Build a function body to pass into `Function` constructor later
 */
export default <T>(
    tree: Tree<T>,
    options: Options,
): MatchFunction<T> => {
    // Global context
    const ctx = createContext(options);

    let content = compileNode(
        tree.root, ctx,
        ctx.pathStartName,
        false, false
    );

    // Fallback
    if (options.fallback)
        ctx.paramsMap[fallback] = options.fallback;

    return Function(
        ...Object.keys(ctx.paramsMap),
        `return ${ctx.contextName}=>{${content}return ${ctx.fallback}}`
    )(...Object.values(ctx.paramsMap));
}
