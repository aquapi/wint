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

const    // Object.assign(node, createNode(...))
    assignNode = (node: Node<any>, part: string) => {
        node.part = part;
        node.inert = new Map();
        node.store = node.params = node.wildcardStore = null;
    },
    setChild = (node: Node<any>, child: Node<any>) => {
        node.inert!.set(child.part.charCodeAt(0), child);
    },
    createNode = (part: string): Node<any> => ({
        part,
        store: null,
        inert: null,
        params: null,
        wildcardStore: null
    }),
    cloneNode = (node: Node<any>, part: string): Node<any> => ({
        part,
        store: node.store,
        inert: node.inert,
        params: node.params,
        wildcardStore: node.wildcardStore
    }),
    createParamNode = (paramName: string): ParamNode<any> => ({
        paramName,
        store: null,
        inert: null
    }),

    staticRegex = /:.+?(?=\/|$)/,
    paramsRegex = /:.+?(?=\/|$)/g;

export class Tree<T> {
    root: Node<T> = createNode('/');

    store(path: string, store: T): T {
        // Path should start with '/'
        if (path.charCodeAt(0) !== 47) path = '/' + path;

        // Ends with '*'
        const isWildcard = path.charCodeAt(path.length - 1) === 42;
        if (isWildcard) path = path.slice(0, -1);

        const inertParts = path.split(staticRegex),
            paramParts = path.match(paramsRegex) ?? [];

        if (inertParts[inertParts.length - 1].length === 0) inertParts.pop();
        let node = this.root, paramPartsIndex = 0;

        for (let i = 0, { length } = inertParts; i < length; ++i) {
            let part = inertParts[i];

            if (i > 0) {
                // Set param on the node
                const param = paramParts[paramPartsIndex].slice(1);
                ++paramPartsIndex;

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

            for (let j = 0; ;) {
                if (j === part.length) {
                    if (j < node.part.length) {
                        // Move the current node down
                        assignNode(node, part);
                        setChild(node, cloneNode(node, node.part.slice(j)));
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
                    const childNode = createNode(part.slice(j));
                    node.inert.set(part.charCodeAt(j), childNode);
                    node = childNode;

                    break;
                }

                if (part[j] !== node.part[j]) {
                    // Split the node
                    const newChild = createNode(part.slice(j));

                    assignNode(node, node.part.slice(0, j));
                    setChild(node, cloneNode(node, node.part.slice(j)));
                    setChild(node, newChild);

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
