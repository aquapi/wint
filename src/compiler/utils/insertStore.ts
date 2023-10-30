import { BuildContext, Handler } from "../../types";
import { storePrefix } from "../constants";

export default <T>(ctx: BuildContext, value: Handler<T>) => {
    let key = storePrefix + ctx.currentID;
    ++ctx.currentID;
    ctx.paramsMap[key] = value;

    return key;
}
