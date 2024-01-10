import { Context } from './types';

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
    wildcard: T;
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

interface Router<T> {
    find(c: Partial<Context>): T | null;
}

class Router<T> {
    root: GenericNode<T> = Node.init();
    defaultResult: T = null;
    staticMap: Record<string, T> = {};

    put(path: string, value: T) {
        if (path.startsWith('/'))
            path = path.substring(1);
        if (path.endsWith('/'))
            path = path.substring(0, path.length - 1);

        // If path is static
        if (!path.includes(':') && !path.endsWith('*')) {
            this.staticMap[path] = value;
            return;
        }

        const parts = path.split('/');
        let node = this.root;

        for (let i = 0, partsLen = parts.length; i < partsLen; ++i) {
            const part = parts[i];

            // End of path so we can return directly
            if (part === '*') {
                node.wildcard = value;
                return this;
            }

            if (part.startsWith(':')) {
                if (node.parameter !== null)
                    throw new Error(`Parameter ${part.substring(1)} collided with previously registered parameter ${node.parameter.name}.`);

                node = node.parameter = Node.init();
                node.name = part.substring(1);
                continue;
            }

            if (typeof node.inerts[part] === 'undefined')
                node.inerts[part] = Node.init();

            node = node.inerts[part];
        }

        node.value = value;
        return this;
    }

    /**
     * Match a path (path should not start or end with a slash)
     */
    build() {
        const { root, defaultResult, staticMap } = this;

        this.find = ctx => {
            const { path } = ctx, res = staticMap[path];
            if (typeof res !== 'undefined')
                return res;

            // Always a wildcard match at root
            if (path === '') {
                if (root.wildcard === null) return defaultResult;

                ctx.params = { '*': path };
                return root.value;
            }

            let node = root,
                wildcardValue: T = null,
                wildcardIndex: number;

            const parts = path.split('/'), params = {};

            for (let i = 0, partsLen = parts.length; i < partsLen; ++i) {
                // If a wildcard exists
                if (node.wildcard !== null) {
                    wildcardValue = node.wildcard;
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
                if (wildcardValue === null) return defaultResult;

                params['*'] = parts.slice(wildcardIndex).join('/');
                ctx.params = params;

                return wildcardValue;
            }

            ctx.params = params;
            return node.value;
        }

        return this;
    }
}

export { Router };
