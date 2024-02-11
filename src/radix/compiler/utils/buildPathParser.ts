import { Options } from '../../types';
import createContext from './createContext';

export default (options: Options): { value: string, path: string } => {
    if (!options.parsePath) return { value: '', path: (options.contextName ?? 'c') + '.url' };
    if (!options.matchPath) return { value: '', path: (options.contextName ?? 'c') + '.path' };

    options.matchPath = false;
    const ctx = createContext(options);
    options.matchPath = true;

    return {
        value: `${ctx.pathStartName}=${ctx.urlName}.indexOf('/'${options.minURLLen === 0 ? '' : ',' + options.minURLLen})+1;`
            + `${ctx.pathEndName}=${ctx.urlName}.indexOf('?',${ctx.pathStartName});`
            + `${ctx.contextName}.path=`
            + `${ctx.pathEndName}===-1`
            + `?${ctx.urlName}.${ctx.substrStrategy}(${ctx.pathStartName})`
            + `:${ctx.urlName}.${ctx.substrStrategy}(${ctx.pathStartName},${ctx.pathEndName});`,
        path: ctx.contextName + '.path'
    };
}
