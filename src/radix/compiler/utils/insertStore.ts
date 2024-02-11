import { BuildContext } from "../../types";
import { storePrefix } from "../constants";

export default (ctx: BuildContext, value: any): string => {
    let key = storePrefix + ctx.currentID;
    ++ctx.currentID;
    ctx.paramsMap[key] = value;

    return key;
}
