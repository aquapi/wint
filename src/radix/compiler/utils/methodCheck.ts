import { BuildContext } from '../../types';
import insertStore from './insertStore';

export default <T>(
    // res is the condition
    res: string | null, handler: T,
    ctx: BuildContext,
    preReturn: string | null,
) => // 
    (res === null ? '' : 'if(' + res + ')')
    + (preReturn === null ? '' : '{' + preReturn)
    + `return ${insertStore(ctx, handler)}${ctx.caller}`
    + (preReturn === null ? '' : '}') + ';';
