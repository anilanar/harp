import {
    patchOuter,
} from 'incremental-dom';

import {
    Children,
    Fragment,
    IBucket,
    IOptions,
    IProps,
    Template,
} from './types';

import options from './options';

import * as dedent from 'dedent-js';

/**
 * Creates a fragment or retrieves it from the cache. Cache strategy can be no-op,
 * never caching fragments. In that case, fragments would always be created.
 * Thus performance of this function heavily depends on the cache strategy.
 */
export function createFragment(
    options: IOptions,
    parentFragment: Fragment|null,
    template: Template,
    key: string|null,
    children: Children|null,
): Fragment {
    const {fragmentCacher: cacher} = options;
    if (parentFragment != null) {
        const childFragment = cacher.getChild(
            parentFragment.cache,
            key,
        );
        if (childFragment != null && childFragment.template === template) {
            cacher.mark(parentFragment.cache, key);
            childFragment.children = children;
            return childFragment;
        }
    }

    const newFragment = {
        key,
        parent: parentFragment,
        element: null,
        cache: options.fragmentCacher.createCache(),
        template,
        children,
        onRemoved: null,
    };

    if (parentFragment != null) {
        cacher.putChild(
            parentFragment.cache,
            newFragment,
        );
    }
    return newFragment;
}

export function refresh(
    fragment: Fragment,
): void {
    if (fragment.element == null) {
        throw new Error(
            dedent`Cannot refresh the node due to it lacking its
            element. Either it's not mounted yet or it's already unmounted.`
        );
    }

    patchOuter(fragment.element, function () {
        fragmentVoid(
            fragment.parent,
            fragment.template,
            fragment.key,
            fragment.children,
            null
        );
    });
}


export function remove(
    fragment: Fragment,
): boolean {
    if (fragment.onRemoved == null) {
        return false;
    }
    fragment.onRemoved();
    return true;
}

export function fragmentVoid(
    parentFragment: Fragment|null,
    template: Template,
    key: string|null,
    children: Children|null,
    props: IProps|null,
): Element {
    const fragment = createFragment(
        options,
        parentFragment,
        template,
        key,
        children
    );
    fragment.element = template(fragment, props, children);
    return fragment.element;
};

export function getBucket(fragment: Fragment): IBucket {
    if (fragment.bucket == null) {
        fragment.bucket = {};
    }
    return fragment.bucket;
}
