import { BuildContext } from "../../types";
import { storePrefix } from "../constants";

export default <T>(ctx: BuildContext, value: T) => {
    let key = storePrefix + ctx.currentID;
    ++ctx.currentID;
    ctx.paramsMap[key] = value;

    return key;
}
