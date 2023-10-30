import { Wint } from '../..';
import handlers from '../lib/handlers';
import { Lookup } from '../lib/types';

const wint = Wint.create(handlers).build();

export default (
    c => () => wint.find(c)
) satisfies Lookup; 
