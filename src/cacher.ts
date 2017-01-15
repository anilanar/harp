import {
    Fragment,
    OnRemoveFromCache,
} from './types';

import {
    throwError,
} from './shared';

import * as dedent from 'dedent-js';

type Cache = {
    keyed: {[key: string]: Fragment|null} | null,
    unkeyed: Array<Fragment|null> | null,
    renderedKeys: {[key: string]: 1|undefined} | null,
    renderedIndices: Array<number> | null,
    getIndex: number,
    markIndex: number,
    removedKeyCount: number,
};

export function createCache(): Cache {
    return {
        keyed: null,
        unkeyed: null,
        renderedKeys: null,
        renderedIndices: null,
        getIndex: 0,
        markIndex: 0,
        removedKeyCount: 0,
    };
}

export function getChild(cache: Cache, key: string|null): Fragment|null {
    if (key == null) {
        if (cache.unkeyed == null) {
            return null;
        }
        const child = cache.unkeyed[cache.getIndex];
        cache.getIndex++;
        return child;
    }
    if (cache.keyed == null) {
        return null;
    }
    return cache.keyed[key];
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
    if (child == null || child.key == null) {
        if (cache.unkeyed == null) {
            cache.unkeyed = [];
        }
        cache.unkeyed.push(child);
        return null;
    }
    if (cache.keyed == null) {
        cache.keyed = {};
    }
    cache.keyed[child.key] = child;
    return null;
}

export function mark(cache: Cache, key: string|null): void {
    if (key == null) {
        console.log(cache.unkeyed && cache.unkeyed.length);
        if (cache.unkeyed == null
            || cache.unkeyed.length <= cache.markIndex
        ) {
            throwError(dedent`
                There is no cached unkeyed fragment left to mark. Make sure
                that you use "putChild" to cache fragments before you "mark"
                them.
            `);
        }

        if (cache.unkeyed[markIndex] == null) {
            throwError(dedent`
                There is no cached unkeyed fragment at the given index. Have
                you forgotten to "mark" a previously created fragment?
            `);
        }

        if (cache.renderedIndices == null) {
            cache.renderedIndices = [cache.markIndex];
        } else {
            cache.renderedIndices.push(cache.markIndex);
        }
        cache.markIndex += 1;
    }
    else {
        if (cache.renderedKeys == null) {
            cache.renderedKeys = {};
        }
        cache.renderedKeys[key] = 1;
    }
}

export function clean(
    cache: Cache,
    onRemove: OnRemoveFromCache,
): void {
    const {keyed, unkeyed, renderedKeys, renderedIndices} = cache;

    if (keyed != null) {
        // go through keyed children
        for (const key in keyed) {
            removeKeyed(cache, keyed, key, onRemove);
        }
    }

    if (unkeyed != null) {
        // go through unkeyed children
        for (let idx = 0; idx < unkeyed.length; idx++) {
            removeUnkeyed(cache, unkeyed, idx, onRemove);
        }
    }

    // reset renderedIndices, renderedKeys and unkeyedIndex
    // don't create additional garbage to collect for GC
    if (renderedIndices != null) {
        renderedIndices.length = 0;
    }
    if (renderedKeys != null) {
        cache.renderedKeys = null;
    }
    cache.getIndex = 0;
    cache.markIndex = 0;
}

function removeKeyed(
    cache: Cache,
    keyed: {[key: string]: Fragment|null},
    key: string,
    onRemove: OnRemoveFromCache,
): void {
    // children.keyed[key] can be null because deleting unmounted children
    // are defered to until that number hits a threshold.
    // in some js engines, delete operator deoptimizes objects thus
    // it is better to copy objects when there are enough keys to
    // delete
    const child = keyed[key];
    if (child == null
        || cache.renderedKeys != null
        && cache.renderedKeys[key] & 1
    ) {
        return;
    }
    keyed[key] = null;
    cache.removedKeyCount += 1;
    onRemove(child);
}

function removeUnkeyed(
    cache: Cache,
    unkeyed: Array<Fragment|null>,
    index: number,
    onRemove: OnRemoveFromCache,
) {
    // children.unkeyed[idx] can be null because null can behave as
    // placeholders for fragments that conditionally render.
    // that allows finding correct fragment for unkeyed fragments.
    const child = unkeyed[index];
    if (child == null
        || cache.renderedIndices != null
        && cache.renderedIndices[index]
    ) {
        return;
    }
    unkeyed.splice(index, 1);
    onRemove(child);
}
