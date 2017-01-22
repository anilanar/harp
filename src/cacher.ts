import {
    IBaseFragment,
    IFragment,
    OnRemoveFromCache,
} from './types';

import {
    dedent,
    throwError,
} from './shared';

type Keyed = {[key: string]: IFragment};
type Unkeyed = Array<IBaseFragment>;

export class Cache {
    getIndex: number;
    keyed: Keyed | undefined;
    keyedCount: number;
    markIndex: number;
    renderedIndices: Array<1|0> | undefined;
    renderedKeys: {[key: string]: 1|undefined} | undefined;
    suggestedCount: number;
    // although we never put undefined into it,
    // for type safety, we union value type with undefined
    // for invalid keys
    unkeyed: Unkeyed | undefined;

    constructor() {
        this.getIndex = 0;
        this.keyed = undefined;
        this.keyedCount = 0;
        this.markIndex = 0;
        this.renderedIndices = undefined;
        this.renderedKeys = undefined;
        this.suggestedCount = 0;
        this.unkeyed = undefined;
    }
}

// how to tell between
// 1) could not find
// 2) empty fragment
export function getChild(
    cache: Cache,
    key: string|undefined,
): IBaseFragment|undefined {
    if (key === undefined) {
        if (unkeyedCount(cache) <= cache.getIndex) {
            cache.getIndex += 1;
            return undefined;
        }
        const child = (cache.unkeyed as Unkeyed)[cache.getIndex];
        cache.getIndex += 1;
        return child;
    }
    if (cache.keyed === undefined) {
        return undefined;
    }
    return cache.keyed[key];
}

/**
 * Caches the fragment in the given cache object. If child fragment lacked a
 * key, cacher can optionally return a new key. Returns undefined if no key
 * is required.
 *
 * For non-keyed fragments, putting undefined placeholders for fragments that are
 * conditionally rendered allows finding the correct fragment for siblings,
 * thus fragment argument can also be undefined and that information should be
 * properly used by the cacher.
 */
export function putChild(
    cache: Cache,
    child: IBaseFragment,
    suggestKeys = false,
): string|undefined {
    // this case might be a common error, so just throw an error
    const isValid = typeof child === 'object'
        && (
            child.isEmpty === true
            || child.isEmpty === false
        );
    if (!isValid) {
        throwError(dedent`
            "putChild" takes a fragment. Provided value:
            ${child}
        `);
    }

    const isUnkeyed = suggestKeys === false
        && (
            child.isEmpty
            || (child as IFragment).key === undefined
        );

    if (isUnkeyed) {
        if (cache.unkeyed === undefined) {
            cache.unkeyed = [];
        }
        cache.unkeyed.push(child);
        return undefined;
    }

    // At this point suggestKeys is true
    // or fragment is keyed
    const keyedChild = <IFragment>child;

    const key = keyedChild.key !== undefined
        ? keyedChild.key
        : `.f${cache.suggestedCount++}`;

    cache.keyed = cache.keyed !== undefined
        ? cache.keyed
        : Object.create(null) as {};

    cache.keyed[key] = keyedChild;
    cache.keyedCount++;
    return key;
}

export function mark(cache: Cache, key: string|undefined): void {
    if (key === undefined) {
        if (unkeyedCount(cache) <= cache.markIndex) {
            throwError(dedent`
                There is no cached unkeyed fragment left to mark. Make sure
                that you use "putChild" to cache fragments before you "mark"
                them.
            `);
        }

        if (cache.renderedIndices === undefined) {
            cache.renderedIndices = [];
        }
        for (let i = cache.renderedIndices.length; i < cache.markIndex; i++) {
            // fill with undefined, we don't like sparse arrays
            cache.renderedIndices.push(0);
        }
        cache.renderedIndices.push(1);
        cache.markIndex += 1;
        return;
    }

    const isInvalid = keyedCount(cache) === 0
        || (cache.keyed as Keyed)[key] === undefined;
    if (isInvalid) {
        throwError(dedent`
            There is no fragment with key ${key} cached. Cannot mark it.
        `);
    }
    if (cache.renderedKeys === undefined) {
        cache.renderedKeys = Object.create(null) as {};
    }
    cache.renderedKeys[key] = 1;
}

export function skip(cache: Cache): void {
    cache.markIndex++;
}

export function clean(
    cache: Cache,
    onRemove: OnRemoveFromCache|undefined,
): void {
    const {keyed, unkeyed} = cache;

    if (keyed !== undefined) {
        // go through keyed children
        const keys = Object.keys(keyed);
        for (let i = 0; i < keys.length; i++) {
            // children.keyed[key] can be undefined because deleting unmounted children
            // are defered to until that number hits a threshold.
            // in some js engines, delete operator deoptimizes objects thus
            // it is better to copy objects when there are enough keys to
            // delete
            const key = keys[i];
            const child = keyed[key];
            if (child === undefined
                || cache.renderedKeys !== undefined
                && cache.renderedKeys[key] & 1
            ) {
                continue;
            }
            delete keyed[key];
            cache.keyedCount--;
            if (onRemove !== undefined) {
                onRemove(child);
            }
        }
    }

    if (unkeyed !== undefined) {
        // go through unkeyed children
        // unkeyed array is modified during iteration thus
        // we need to trace two indices, one is used for accessing unkeyed
        // the other is used accessing rendered indices.
        for (let index = 0, realIndex = 0; realIndex < unkeyed.length; index++) {
            if(!removeUnkeyed(cache, unkeyed, index, realIndex, onRemove)) {
                realIndex++;
            }
        }
    }

    reset(cache);
}

export function reset(
    cache: Cache,
): void {
    // reset renderedIndices, renderedKeys and unkeyedIndex
    // don't create additional garbage to collect for GC
    const {renderedKeys, renderedIndices} = cache;
    if (renderedIndices !== undefined) {
        renderedIndices.length = 0;
    }
    if (renderedKeys !== undefined) {
        cache.renderedKeys = undefined;
    }
    cache.getIndex = 0;
    cache.markIndex = 0;
}


export function keyedCount(cache: Cache): number {
    return cache.keyedCount;
}

export function unkeyedCount(cache: Cache): number {
    if (cache.unkeyed === undefined) {
        return 0;
    }
    return cache.unkeyed.length;
}

function removeUnkeyed(
    cache: Cache,
    unkeyed: Array<IBaseFragment>,
    index: number,
    unkeyedIndex: number,
    onRemove: OnRemoveFromCache|undefined,
): boolean {
    const child = unkeyed[unkeyedIndex];
    const marked = cache.renderedIndices
        && cache.renderedIndices[index];

    if (marked & 1) {
        return false;
    }
    unkeyed.splice(unkeyedIndex, 1);
    // children.unkeyed[idx] can be undefined because undefined can behave as
    // placeholders for fragments that conditionally render.
    // that allows finding correct fragment for unkeyed fragments.
    if (onRemove !== undefined && !child.isEmpty) {
        onRemove(child as IFragment);
    }
    return true;
}
