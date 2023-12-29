import { BuildContext, Options } from '../../types';
import { fallback } from '../constants';

export default (options: Options): BuildContext => {
    // Fix missing options 
    options.contextName ??= 'c';
    options.substr ??= 'substring';
    options.matchPath ??= false;
    options.minURLLen ??= 12;
    options.directCall ??= false;

    const caller = options.directCall ? `(${options.contextName})` : '';

    return {
        // Path start can be static if a static map is provided
        pathStartName: options.pathStart?.toString() ?? (options.matchPath ? '0' : options.contextName + '._pathStart'),
        pathEndName: options.contextName + '.' + (options.matchPath ? 'path.length' : '_pathEnd'),

        urlName: options.contextName + '.' + (options.matchPath ? 'path' : 'url'),
        paramsName: options.contextName + '.params',

        // These props will be changed
        currentID: 0,
        paramsMap: {},

        caller,

        substrStrategy: options.substr,
        contextName: options.contextName,

        fallback: options.fallback ? fallback + caller : 'null',

        hasPath: options.matchPath
    }
};
