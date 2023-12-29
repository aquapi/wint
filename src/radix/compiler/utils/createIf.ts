import { Node } from "../../tree";
import { BuildContext, } from "../../types";
import plus from "./plus";

export default <T>(
    ctx: BuildContext,
    node: Node<T>,
    prevPathLen: string, pathLen: string
) => {
    // Much faster than doing substring
    if (node.part.length < 3) {
        let result = '';

        for (var i = 1; i < node.part.length; ++i) {
            result += `if(${ctx.urlName}.charCodeAt(${prevPathLen})===${node.part.charCodeAt(i)})`;
            prevPathLen = plus(prevPathLen, 1);
        }

        return result;
    }

    return `if(${ctx.urlName}.${ctx.substrStrategy}(${prevPathLen},${pathLen})==='${node.part.substring(1)}')`;
}
