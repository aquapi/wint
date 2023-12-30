/**
 * Extract parameters from a path
 */
export type Params<T extends string> = T extends `${infer Segment}/${infer Rest}`
    ? (Segment extends `:${infer Param}`
        ? (Rest extends `*` ? { [K in Param]: string } : { [K in Param]: string } & Params<Rest>)
        : {}) & Params<Rest>
    : T extends `:${infer Param}`
    ? { [K in Param]: string }
    : T extends `*`
    ? { '*': string }
    : {};

export interface Context<Path extends string = string, State extends BaseState = {}> extends ResponseInit {
    /**
     * Raw request object
     */
    req: Request,

    /**
     * Request path
     */
    path: Path;

    /**
     * Request params
     */
    params: Params<Path> & BaseParams;

    /**
     * Store state in requests
     */
    state: State & BaseState;

    /**
     * URL path start
     */
    _pathStart: number;

    /**
     * URL path end
     */
    _pathEnd: number;
}

export interface BaseState extends Record<string, any> { };

export interface BaseParams extends Record<string, string> { };
