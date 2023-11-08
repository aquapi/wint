import { Options } from "../../types";
import createContext from "./createContext";

export default (options: Options) => {
    if (!options.matchPath) return () => { };

    options.matchPath = false;
    const ctx = createContext(options);
    options.matchPath = true;

    return Function(
        `return ${ctx.contextName}=>{${ctx.contextName}.path=`
        + `${ctx.pathEndName}===-1`
        + `?${ctx.urlName}.${ctx.substrStrategy}(${ctx.pathStartName})`
        + `:${ctx.urlName}.${ctx.substrStrategy}(${ctx.pathStartName},${ctx.pathEndName})}`
    )();
}
