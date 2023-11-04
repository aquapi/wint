import { Router } from "../types/types";

export default <T extends Router<string>>(t: T) => t
    .put('GET', '/', 'A')
    .put('POST', '/json', 'B')
    .put('GET', '/id/:id', 'C')
    .put('GET', '/:user/account', 'D')
    .build();

