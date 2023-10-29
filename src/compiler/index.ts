import type { Tree } from "../tree";
import type { Handler, BuildContext, Store, SubstrStrategy } from "../types";
import { method } from "./constants";
import compileNode from './node';

export default <T>(tree: Tree<Store<T>>, contextName: string = 'ctx', substrStrategy: SubstrStrategy = 'substring') => {
    const ctx: BuildContext<Handler<T>> = {
        substrStrategy, contextName,
        urlName: contextName + '.url',
        pathEndName: contextName + '._pathEnd',
        methodName: method,
        paramsName: contextName + '.params',
        currentID: 0,
        paramsMap: {}
    };

    return {
        content: `var ${method}=${contextName}.method;${compileNode(
            tree.root, ctx,
            contextName + '._pathStart', false
        )}return null;`,
        meta: ctx
    };
}
