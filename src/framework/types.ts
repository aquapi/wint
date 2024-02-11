export const wildcard = '*';
export type Wildcard = typeof wildcard;

type InferSegment<T extends string> = T extends `:${infer Param}`
    ? { [K in Param]: string }
    : T extends Wildcard
    ? { [K in Wildcard]: string }
    : {};

/**
 * Extract parameters from a path
 */
export type Params<T extends string> = T extends `${infer Segment}/${infer Rest}`
    ? InferSegment<Segment> & Params<Rest>
    : InferSegment<T>;

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
    state: State;

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
