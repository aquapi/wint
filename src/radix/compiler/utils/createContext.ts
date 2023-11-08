import { BuildContext, Options } from '../../types';

export default (options: Options): BuildContext => {
    // Fix missing options 
    options.contextName ??= 'c';
    options.substr ??= 'substring';
    options.matchPath ??= false;

    return {
        // Path start can be static if a static map is provided
        pathStartName: options.matchPath ? '0' : options.contextName + '._pathStart',
        pathEndName: options.contextName + '.' + (options.matchPath ? 'path.length' : '_pathEnd'),

        urlName: options.contextName + '.' + (options.matchPath ? 'path' : 'url'),
        paramsName: options.contextName + '.params',

        // These props will be changed
        currentID: 0,
        paramsMap: {},

        substrStrategy: options.substr,
        contextName: options.contextName,

        hasPath: options.matchPath
    }
};
