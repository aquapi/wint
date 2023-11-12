import { Router } from "../types/types";

const f = (str: string, isFn: boolean) =>
    isFn ? () => str : str

export default <T extends Router<any>>(t: T, isFn: boolean = false) => t
    .put('GET', '/', f('A', isFn))
    .put('POST', '/json', f('B', isFn))
    .put('GET', '/id/:id', f('C', isFn))
    .put('GET', '/:user/account', f('D', isFn))
    .build();

