import { Node } from "../../tree";
import { BuildContext, } from "../../types";
import plus from "./plus";

export default (
    ctx: BuildContext,
    node: Node<any>,
    prevPathLen: string, pathLen: string
): string => {
    // Faster than doing substring
    if (node.part.length < 15) {
        const result = [];

        for (let i = 1, { length } = node.part; i < length; ++i) {
            result.push(`if(${ctx.urlName}.charCodeAt(${prevPathLen})===${node.part.charCodeAt(i)})`);
            prevPathLen = plus(prevPathLen, 1);
        }

        return result.join('');
    }

    return `if(${ctx.urlName}.${ctx.substrStrategy}(${prevPathLen},${pathLen})==='${node.part.substring(1)}')`;
}
