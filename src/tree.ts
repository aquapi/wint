export interface FindResult<T> {
    store: T
    params: Record<string, any>
}

export interface ParamNode<T> {
    paramName: string
    store: T | null
    inert: Node<T> | null
}

export interface Node<T> {
    part: string
    store: T | null
    inert: Map<number, Node<T>> | null
    params: ParamNode<T> | null
    wildcardStore: T | null
}

const
    createNode = <T>(part: string, inert?: Node<T>[]): Node<T> => ({
        part,
        store: null,
        inert:
            inert !== undefined
                ? new Map(inert.map((child) => [child.part.charCodeAt(0), child]))
                : null,
        params: null,
        wildcardStore: null
    }),

    cloneNode = <T>(node: Node<T>, part: string) => ({
        ...node,
        part
    }),

    createParamNode = <T>(paramName: string): ParamNode<T> => ({
        paramName,
        store: null,
        inert: null
    }),

    staticRegex = /:.+?(?=\/|$)/,
    paramsRegex = /:.+?(?=\/|$)/g;

export class Tree<T> {
    root!: Node<T>;

    store(path: string, store: T): FindResult<T>['store'] {
        if (typeof path !== 'string')
            throw new TypeError('Route path must be a string');

        if (path === '') path = '/';
        else if (path[0] !== '/') path = '/' + path;

        const isWildcard = path[path.length - 1] === '*';
        if (isWildcard)
            // Slice off trailing '*'
            path = path.slice(0, -1);

        const inertParts = path.split(staticRegex),
            paramParts = path.match(paramsRegex) || [];

        if (inertParts[inertParts.length - 1] === '') inertParts.pop();

        let node: Node<T>;

        if (!this.root) node = this.root = createNode<T>('/');
        else node = this.root;

        let paramPartsIndex = 0;

        for (var i = 0; i < inertParts.length; ++i) {
            var part = inertParts[i];

            if (i > 0) {
                // Set param on the node
                const param = paramParts[paramPartsIndex++].slice(1);

                if (node.params === null)
                    node.params = createParamNode(param);
                else if (node.params.paramName !== param)
                    throw new Error(
                        `Cannot create route "${path}" with parameter "${param}" ` +
                        'because a route already exists with a different parameter name ' +
                        `("${node.params.paramName}") in the same location`
                    );

                const params = node.params;

                if (params.inert === null) {
                    node = params.inert = createNode(part);
                    continue;
                }

                node = params.inert;
            }

            for (var j = 0; ;) {
                if (j === part.length) {
                    if (j < node.part.length) {
                        // Move the current node down
                        const childNode = cloneNode(node, node.part.slice(j));
                        Object.assign(node, createNode(part, [childNode]));
                    }
                    break;
                }

                if (j === node.part.length) {
                    // Add static child
                    if (node.inert === null) node.inert = new Map();
                    else if (node.inert.has(part.charCodeAt(j))) {
                        // Re-run loop with existing static node
                        node = node.inert.get(part.charCodeAt(j))!;
                        part = part.slice(j);
                        j = 0;
                        continue;
                    }

                    // Create new node
                    const childNode = createNode<T>(part.slice(j));
                    node.inert.set(part.charCodeAt(j), childNode);
                    node = childNode;

                    break;
                }

                if (part[j] !== node.part[j]) {
                    // Split the node
                    const existingChild = cloneNode(node, node.part.slice(j));
                    const newChild = createNode<T>(part.slice(j));

                    Object.assign(
                        node,
                        createNode(node.part.slice(0, j), [
                            existingChild,
                            newChild
                        ])
                    );

                    node = newChild;
                    break;
                }

                ++j;
            }
        }

        if (paramPartsIndex < paramParts.length) {
            // The final part is a parameter
            const param = paramParts[paramPartsIndex],
                paramName = param.slice(1);

            if (node.params === null)
                node.params = createParamNode(paramName);
            else if (node.params.paramName !== paramName)
                throw new Error(
                    `Cannot create route "${path}" with parameter "${paramName}" ` +
                    'because a route already exists with a different parameter name ' +
                    `("${node.params.paramName}") in the same location`
                );

            if (node.params.store === null) node.params.store = store;

            return node.params.store!;
        }

        if (isWildcard) {
            // The final part is a wildcard
            if (node.wildcardStore === null) node.wildcardStore = store;

            return node.wildcardStore!;
        }

        // The final part is static
        if (node.store === null) node.store = store;

        return node.store;
    }
}
