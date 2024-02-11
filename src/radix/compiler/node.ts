import type { Node } from '../tree';
import plus from './utils/plus';
import type { BuildContext } from '../types';
import storeCheck from './utils/storeCheck';
import { currentParamIndexName, prevParamIndexName } from './constants';
import createTopLevelCheck from './utils/createTopLevelCheck';

const f = (
    node: Node<any>,
    ctx: BuildContext,
    prevPathLen: string,
    // Whether parameters exist
    isChildParam: boolean,
    // Whether the index tracker for parameters exists (not creating many variables)
    isNestedChildParam: boolean
) => {
    // Get current pathname
    const
        builder: string[] = [],
        isNotRoot = node.part.length !== 1,
        pathLen = plus(
            prevPathLen,
            node.part.length - 1
        );

    // No condition check for root
    if (isNotRoot)
        builder.push(createTopLevelCheck(ctx, node, prevPathLen, pathLen), '{');

    // Normal handler
    if (node.store !== null)
        builder.push(storeCheck(
            `${ctx.pathEndName}===${pathLen}`,
            node.store, ctx, null
        ));

    if (node.inert !== null) {
        const keys = node.inert.keys(), newPathLen = plus(pathLen, 1);
        let it = keys.next();

        // Create an if statement for only one item
        if (node.inert.size === 1) {
            builder.push(`if(${ctx.urlName}.charCodeAt(${pathLen})===${it.value})`);

            builder.push(...f(
                node.inert.get(it.value)!, ctx,
                newPathLen, isChildParam, isNestedChildParam
            ));
        }

        // Create a switch for multiple items
        else {
            builder.push(`switch(${ctx.urlName}.charCodeAt(${pathLen})){`);

            do {
                // Create a case statement for each char code
                builder.push(`case ${it.value}:`);
                builder.push(...f(
                    node.inert.get(it.value)!, ctx,
                    newPathLen, isChildParam, isNestedChildParam
                ));
                builder.push('break;');

                it = keys.next();
            } while (!it.done);

            // Close bracket
            builder.push('}');
        }
    }

    if (node.params !== null) {
        const prevIndex = isChildParam ? prevParamIndexName : pathLen;

        // Declare previous param index
        if (isChildParam) {
            if (!isNestedChildParam)
                builder.push('let ');

            builder.push(`${prevParamIndexName}=${pathLen};`);
        }

        const nextSlashIndex = `${ctx.urlName}.indexOf('/',${prevIndex})`,
            hasInert = node.params.inert !== null,
            hasStore = node.params.store !== null,
            key = node.params.paramName;

        // Declare the current param index variable if inert is found
        if (hasInert) {
            if (!isChildParam)
                builder.push('let ');

            builder.push(`${currentParamIndexName}=${nextSlashIndex};`);
        }

        // Slice the value if a store is found
        if (hasStore) {
            const value = `${ctx.urlName}.${ctx.substrStrategy}(${prevIndex}${
                // Optimization for path matching instead of whole URL 
                ctx.hasPath ? '' : ',' + ctx.pathEndName
                })`;

            builder.push(storeCheck(
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
            builder.push(...f(
                node.params.inert!, ctx,
                plus(currentParamIndexName, 1), true,
                // If this is the first inert this will be false
                isChildParam
            ));
        }
    }

    if (node.wildcardStore !== null) {
        const value = `${ctx.urlName}.${ctx.substrStrategy}(${pathLen})`;

        // Assign wildcard parameter
        builder.push(ctx.paramsName);
        builder.push(isChildParam ? `['${ctx.wildcardName}']=${value};` : `={'${ctx.wildcardName}':${value}};`)
        builder.push(storeCheck(null, node.wildcardStore, ctx, null));
    }

    // Root does not include a check
    if (isNotRoot) builder.push('}');

    return builder;
};

export default f;
