import type { Node } from '../tree';
import plus from './utils/plus';
import type { BuildContext, Handler, Store } from '../types';
import methodCheck from './utils/methodCheck';
import { currentParamIndexName, prevParamIndexName } from './constants';
import createIf from './utils/createIf';

export default function f<T>(
    node: Node<Store<T>>,
    ctx: BuildContext<Handler<T>>,
    prevPathLen: string,
    isChildParam: boolean
) {
    // Get current pathname
    let
        isRoot = node.part.length === 1,
        pathLen = plus(
            prevPathLen,
            node.part.length - 1
        ),
        // No handling for root
        result = isRoot ? '' : createIf(
            ctx, node, prevPathLen, pathLen
        ) + '{';

    // Normal handler
    if (node.store !== null)
        result += methodCheck(
            `${pathLen}===${ctx.pathEndName}`,
            node.store, ctx, null
        );

    if (node.inert !== null) {
        let keys = node.inert.keys(), it = keys.next();

        // Only one item
        if (node.inert.size === 1)
            result += `if(${ctx.urlName}.charCodeAt(${pathLen})===${it.value})` + f(
                node.inert.get(it.value)!, ctx,
                plus(pathLen, 1), isChildParam
            );

        // Create a switch
        else {
            result += `switch(${ctx.urlName}.charCodeAt(${pathLen})){`;

            do {
                result += `case ${it.value}:` + f(
                    node.inert.get(it.value)!, ctx,
                    plus(pathLen, 1), isChildParam
                ) + 'break;';

                it = keys.next();
            } while (!it.done);

            result += '}';
        }
    }

    if (node.params !== null) {
        // Declare previous param index
        result += (isChildParam ? '' : 'var ')
            + `${prevParamIndexName}=${pathLen};`;

        const nextSlashIndex = `${ctx.urlName}.indexOf('/',${prevParamIndexName})`,
            hasInert = node.params.inert !== null,
            hasStore = node.params.store !== null,
            key = node.params.paramName;

        // Declare the current param index variable if inert is found
        if (hasInert)
            result += (isChildParam ? '' : 'var ')
                + `${currentParamIndexName}=${nextSlashIndex};`;

        // Slice the value if a store is found
        if (hasStore) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevParamIndexName},${ctx.pathEndName})`;

            result += methodCheck(
                `${hasInert ? currentParamIndexName : nextSlashIndex}===-1`,
                node.params.store!, ctx,
                // Set params before return
                `${ctx.paramsName}${isChildParam
                    ? `.${key}=${value}`
                    : `={${key}:${value}}`
                }`
            );
        }

        if (hasInert) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevParamIndexName},${currentParamIndexName})`;

            // Additional check if no store is provided
            result += (hasStore ? '' : `if(${currentParamIndexName}===-1)return null;`)
                + `${ctx.paramsName}${isChildParam
                    ? `.${key}=${value}`
                    : `={${key}:${value}}`
                };`
                + f(
                    node.params.inert!, ctx,
                    plus(currentParamIndexName, 1), true
                );
        }
    }

    if (node.wildcardStore !== null) {
        const value = `${ctx.urlName}.${ctx.substrStrategy}(${pathLen})`;

        result += ctx.paramsName + (isChildParam ? `['*']=${value}` : `={'*':${value}}`)
            + ';' + methodCheck(null, node.wildcardStore, ctx, null);
    }

    return isRoot ? result : result + '}';
}
