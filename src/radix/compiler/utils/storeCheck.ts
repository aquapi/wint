import { BuildContext } from '../../types';
import insertStore from './insertStore';

export default (
    // res is the condition
    condition: string | null, handler: any,
    ctx: BuildContext,
    preReturn: string | null,
): string => // 
    (condition === null ? '' : 'if(' + condition + ')')
    + (preReturn === null ? '' : '{' + preReturn)
    + `return ${insertStore(ctx, handler)}${ctx.caller}`
    + (preReturn === null ? '' : '}') + ';';
