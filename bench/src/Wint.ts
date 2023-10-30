import { Wint } from '../..';
import handlers from '../lib/handlers';
import { Lookup } from '../lib/types';

const wint = Wint.create(handlers);

// Static map should only be used in certain cases
wint.options.staticMap = {};
wint.build();

export default (
    c => () => wint.find(c)
) satisfies Lookup; 
