import { Context } from '../..';
import { LookupFunctions } from './types';

export default (group: any, bench: any, c: Context, fns: LookupFunctions) => {
    const hasPath = !!c.path,
        normalPath = hasPath ? c.path! : c.url!,
        label = c.method + ' ' + normalPath;

    // Normalize path for Wint
    if (hasPath)
        c.path = c.path!.substring(1);
    else {
        c._pathStart = 1;
        c._pathEnd = c.url!.length
    }

    group(label, () => {
        // Print search result before running tests
        console.log('----', label, '----');
        console.log('Context:', c);

        for (var key in fns) {
            const fn = fns[key](c, normalPath);

            console.log(key + ':', fn());
            bench(key, fn);
        }

        console.log();
    });
}

