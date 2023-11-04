import type { Node } from '../tree';
import plus from './utils/plus';
import type { BuildContext } from '../types';
import methodCheck from './utils/methodCheck';
import { currentParamIndexName, prevParamIndexName } from './constants';
import createIf from './utils/createIf';

const f = <T>(
    node: Node<T>,
    ctx: BuildContext,
    prevPathLen: string,
    isChildParam: boolean,
    isNestedChildParam: boolean
) => {
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
            `${ctx.pathEndName}===${pathLen}`,
            node.store, ctx, null
        );

    if (node.inert !== null) {
        let keys = node.inert.keys(), it = keys.next();

        // Only one item
        if (node.inert.size === 1)
            result += `if(${ctx.urlName}.charCodeAt(${pathLen})===${it.value})` + f(
                node.inert.get(it.value)!, ctx,
                plus(pathLen, 1), isChildParam, isNestedChildParam
            );

        // Create a switch
        else {
            result += `switch(${ctx.urlName}.charCodeAt(${pathLen})){`;

            do {
                result += `case ${it.value}:` + f(
                    node.inert.get(it.value)!, ctx,
                    plus(pathLen, 1), isChildParam, isNestedChildParam
                ) + 'break;';

                it = keys.next();
            } while (!it.done);

            result += '}';
        }
    }

    if (node.params !== null) {
        const prevIndex = isChildParam ? prevParamIndexName : pathLen;

        // Declare previous param index
        if (isChildParam)
            result += (isNestedChildParam ? '' : 'let ')
                + `${prevParamIndexName}=${pathLen};`;

        const nextSlashIndex = `${ctx.urlName}.indexOf('/',${prevIndex})`,
            hasInert = node.params.inert !== null,
            hasStore = node.params.store !== null,
            key = node.params.paramName;

        // Declare the current param index variable if inert is found
        if (hasInert)
            result += (isChildParam ? '' : 'let ')
                + `${currentParamIndexName}=${nextSlashIndex};`;

        // Slice the value if a store is found
        if (hasStore) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevIndex}${
                // Optimization for path matching instead of whole URL 
                ctx.hasPath ? '' : ',' + ctx.pathEndName
                })`;

            result += methodCheck(
                `${hasInert ? currentParamIndexName : nextSlashIndex}===-1`,
                node.params.store!, ctx,
                // Set params before return
                `${ctx.paramsName}${isChildParam
                    ? `.${key}=${value}`
                    : `={${key}:${value}}`
                };`
            );
        }

        if (hasInert) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevIndex},${currentParamIndexName})`;

            // Additional check if no store is provided
            result += (hasStore ? '' : `if(${currentParamIndexName}===-1)return null;`)
                + `${ctx.paramsName}${isChildParam
                    ? `.${key}=${value}`
                    : `={${key}:${value}}`
                };`
                + f(
                    node.params.inert!, ctx,
                    plus(currentParamIndexName, 1), true,
                    // If this is the first inert this will be false
                    isChildParam
                );
        }
    }

    if (node.wildcardStore !== null) {
        const value = `${ctx.urlName}.${ctx.substrStrategy}(${pathLen})`;

        result += ctx.paramsName + (isChildParam ? `['*']=${value}` : `={'*':${value}}`)
            + ';' + methodCheck(null, node.wildcardStore, ctx, null);
    }

    return isRoot ? result : result + '}';
};

export default f;
