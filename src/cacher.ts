import {
    Fragment,
    OnRemoveFromCache,
} from './types';


type Cache = {
    children: Children,
    renderedKeys: RenderedKeys,
    renderedIndices: RenderedIndices,
    unkeyedIndex: number,
};
type Children = {
    keyed?: {[key: string]: Fragment|null},
    unkeyed?: Array<Fragment|null>,
};

type RenderedKeys = {[key: string]: 1};
type RenderedIndices = Array<undefined|1>

export function createCache(): Cache {
    return {
        children: {},
        renderedKeys: {},
        renderedIndices: [],
        // unkeyedIndex can be used both to generate a key
        // or keep track of unkeyed lists of fragments
        unkeyedIndex: 0,
    };
}

export function getChild(cache: Cache, key: string|null): Fragment|null {
    const {children} = cache;
    if (key == null) {
        if (children.unkeyed == null) {
            return null;
        }
        const child = children.unkeyed[cache.unkeyedIndex];
        return child;
    }
    if (children.keyed == null) {
        return null;
    }
    return children.keyed[key];
}

/**
 * Caches the fragment in the given cache object. If child fragment lacked a
 * key, cacher can optionally return a new key. Returns null if no key
 * is required.
 *
 * For non-keyed fragments, putting null placeholders for fragments that are
 * conditionally rendered allows finding the correct fragment for siblings,
 * thus fragment argument can also be null and that information should be
 * properly used by the cacher.
 */
export function putChild(cache: Cache, child: Fragment|null): string|null {
    const {children} = cache;
    if (child == null || child.key == null) {
        if (children.unkeyed == null) {
            children.unkeyed = [];
        }
        children.unkeyed.push(child);
        return null;
    }
    if (children.keyed == null) {
        children.keyed = {};
    }
    children.keyed[child.key] = child;
    return null;
}

export function mark(cache: Cache, key: string|null): void {
    if (key == null) {
        cache.renderedIndices[cache.unkeyedIndex] = 1;
        cache.unkeyedIndex += 1;
    }
    else {
        cache.renderedKeys[key] = 1;
    }
}

export function clean(
    cache: Cache,
    onRemove: OnRemoveFromCache,
): void {
    const {children, renderedKeys, renderedIndices} = cache;

    if (children.keyed != null) {
        // go through keyed children
        for (const key in children.keyed) {
            // children.keyed[key] can be null because deleting unmounted children
            // are defered to until that number hits a threshold.
            // in some js engines, delete operator deoptimizes objects thus
            // it is better to copy objects when there are enough keys to
            // delete
            const child = children.keyed[key];
            if (child != null && !(renderedKeys[key] & 1)) {
                onRemove(child);
            }
        }
    }

    if (children.unkeyed != null) {
        // go through unkeyed children
        for (let idx = 0; idx < renderedIndices.length; idx++) {
            // children.unkeyed[idx] can be null because null can behave as
            // placeholders for fragments that conditionally render.
            // that allows finding correct fragment for unkeyed fragments.
            const child = children.unkeyed[idx];
            if (child != null && !(renderedIndices[idx] & 1)) {
                onRemove(child);
            }
        }
    }

    // reset renderedIndices, renderedKeys and unkeyedIndex
    cache.renderedIndices = [];
    cache.renderedKeys = {};
    cache.unkeyedIndex = 0;
}
