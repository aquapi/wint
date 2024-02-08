import type { Node } from '../tree';
import plus from './utils/plus';
import type { BuildContext } from '../types';
import methodCheck from './utils/methodCheck';
import { currentParamIndexName, prevParamIndexName } from './constants';
import createIf from './utils/createIf';

const arrPush = Array.prototype.push;

const f = <T>(
    node: Node<T>,
    ctx: BuildContext,
    prevPathLen: string,
    isChildParam: boolean,
    isNestedChildParam: boolean
) => {
    let builder: string[] = [];

    // Get current pathname
    let
        isRoot = node.part.length === 1,
        pathLen = plus(
            prevPathLen,
            node.part.length - 1
        );

    // No condition check for root
    if (!isRoot)
        builder.push(createIf(ctx, node, prevPathLen, pathLen), '{');

    // Normal handler
    if (node.store !== null)
        builder.push(methodCheck(
            `${ctx.pathEndName}===${pathLen}`,
            node.store, ctx, null
        ));

    if (node.inert !== null) {
        let keys = node.inert.keys(), it = keys.next();

        // Only one item
        if (node.inert.size === 1) {
            builder.push(`if(${ctx.urlName}.charCodeAt(${pathLen})===${it.value})`);

            // Small optimization
            arrPush.apply(builder, f(
                node.inert.get(it.value)!, ctx,
                plus(pathLen, 1), isChildParam, isNestedChildParam
            ));
        }

        // Create a switch
        else {
            builder.push(`switch(${ctx.urlName}.charCodeAt(${pathLen})){`);

            do {
                // Handle case statement stuff
                builder.push(`case ${it.value}:`);

                // Small optimization
                arrPush.apply(builder, f(
                    node.inert.get(it.value)!, ctx,
                    plus(pathLen, 1), isChildParam, isNestedChildParam
                ));

                builder.push('break;');

                it = keys.next();
            } while (!it.done);

            builder.push('}');
        }
    }

    if (node.params !== null) {
        const prevIndex = isChildParam ? prevParamIndexName : pathLen;

        // Declare previous param index
        if (isChildParam) {
            builder.push(isNestedChildParam ? '' : 'let ');
            builder.push(`${prevParamIndexName}=${pathLen};`);
        }

        const nextSlashIndex = `${ctx.urlName}.indexOf('/',${prevIndex})`,
            hasInert = node.params.inert !== null,
            hasStore = node.params.store !== null,
            key = node.params.paramName;

        // Declare the current param index variable if inert is found
        if (hasInert) {
            builder.push(isChildParam ? '' : 'let ');
            builder.push(`${currentParamIndexName}=${nextSlashIndex};`);
        }

        // Slice the value if a store is found
        if (hasStore) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevIndex}${
                // Optimization for path matching instead of whole URL 
                ctx.hasPath ? '' : ',' + ctx.pathEndName
                })`;

            builder.push(methodCheck(
                `${hasInert ? currentParamIndexName : nextSlashIndex}===-1`,
                node.params.store!, ctx,
                // Set params before return
                `${ctx.paramsName}${isChildParam
                    ? `.${key}=${value}`
                    : `={${key}:${value}}`
                };`
            ));
        }

        if (hasInert) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevIndex},${currentParamIndexName})`;

            // Additional check if no store is provided
            builder.push(hasStore ? '' : `if(${currentParamIndexName}===-1)return ${ctx.fallback};`);

            // Assign param
            builder.push(ctx.paramsName);
            builder.push(isChildParam
                ? `.${key}=${value};`
                : `={${key}:${value}};`
            );

            // Handle inert
            arrPush.apply(builder, f(
                node.params.inert!, ctx,
                plus(currentParamIndexName, 1), true,
                // If this is the first inert this will be false
                isChildParam
            ));
        }
    }

    if (node.wildcardStore !== null) {
        const value = `${ctx.urlName}.${ctx.substrStrategy}(${pathLen})`;

        // Wildcard parameter
        builder.push(ctx.paramsName);
        builder.push(isChildParam ? `['*']=${value};` : `={'*':${value}};`)
        builder.push(methodCheck(null, node.wildcardStore, ctx, null));
    }

    // Root does not include a check
    if (!isRoot) builder.push('}');

    return builder;
};

export default f;
