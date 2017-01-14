import {
    Fragment,
} from './types';

import {remove} from './fragment';

type Cache = {
    children: Children,
    renderedKeys: RenderedKeys,
};
type Children = {[key: string]: Fragment};
type RenderedKeys = {[key: string]: 1};

export function createCache(): Cache {
    return {
        children: {},
        renderedKeys: {},
    };
}

export function getChild(cache: Cache, key: string): Fragment|null {
    return cache.children[key] || null;
}

export function putChild(cache: Cache, child: Fragment): void {
    cache.children[child.key] = child;
}

export function mark(cache: Cache, key: string): void {
    cache.renderedKeys[key] = 1;
}

export function clean(cache: Cache): void {
    const {children, renderedKeys} = cache;
    for (const key in children) {
        if (renderedKeys[key] & 1) {
            remove(children[key]);
        }
    }
}
