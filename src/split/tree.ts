interface Node<T> {
    value: T | null;

    inerts: Record<string, Node<T> | ParamsNode<T> | WildcardNode<T>>;
}

interface Parameter {
    name?: string;
}

interface ParamsNode<T> extends Node<T> {
    parameter: Node<T> & Parameter;
}

interface WildcardNode<T> extends Node<T> {
    wildcard: Node<T>;
}

type GenericNode<T> = Partial<ParamsNode<T> & WildcardNode<T> & Parameter> & Node<T>;

class Node<T> {
    static init<T = any>(): GenericNode<T> {
        return {
            value: null,
            inerts: {},
            parameter: null,
            wildcard: null,
        };
    }
}

export class Tree<T> {
    root: GenericNode<T> = Node.init();
    defaultResult: T = null;

    put(path: string) {
        if (path.startsWith('/'))
            path = path.substring(1);
        if (path.endsWith('/'))
            path = path.substring(0, path.length - 1);

        if (path === '')
            return this.root;

        const parts = path.split('/');
        let node = this.root;

        for (let i = 0, partsLen = parts.length; i < partsLen; ++i) {
            const part = parts[i];

            // End of path so we can break
            if (part === '*') {
                node = node.wildcard = Node.init();
                break;
            }

            if (part.startsWith(':')) {
                node = node.parameter = Node.init();
                node.name = part.substring(1);
                continue;
            }

            if (typeof node.inerts[part] === 'undefined')
                node.inerts[part] = Node.init();

            node = node.inerts[part];
        }

        return node;
    }

    /**
     * Match a path (path should not start or end with a slash)
     * Only use this for dynamic path matching
     */
    build() {
        const { root, defaultResult } = this;

        return (ctx: { path: string, params?: any }): T | null => {
            const { path } = ctx;

            // Always a wildcard match at root
            if (path === '') {
                ctx.params = { '*': path };
                return root.value;
            }

            let node = root,
                wildcard: Node<T> = null,
                wildcardIndex: number;

            const parts = path.split('/'), params = {};

            for (let i = 0, partsLen = parts.length; i < partsLen; ++i) {
                // If a wildcard exists
                if (node.wildcard !== null) {
                    wildcard = node.wildcard;
                    wildcardIndex = i;
                }

                const next = node.inerts[parts[i]];

                // If no next node exists
                if (typeof next === 'undefined') {
                    // Check URL parameter
                    if (node.parameter === null) break;

                    node = node.parameter;
                    params[node.name] = parts[i];
                } else node = next;
            }

            if (node.value === null) {
                if (wildcard === null) return defaultResult;

                params['*'] = parts.slice(wildcardIndex).join('/');
                node = wildcard;
            }

            ctx.params = params;
            return node.value;
        }
    }
}
