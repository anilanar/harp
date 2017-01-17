import {
    patchOuter,
} from 'incremental-dom';

import {
    Children,
    EmptyFragment,
    IBaseFragment,
    IFragment,
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
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
): IBaseFragment {
    if (parentFragment === undefined) {
        return createNewFragment(
            options,
            parentFragment,
            template,
            key,
            children
        );
    }

    const {fragmentCacher: cacher} = options;
    const childFragment = cacher.getChild(
        parentFragment.cache,
        key,
    );
    const shouldCreateNew = childFragment === undefined
        || !childFragment.isEmpty
        && (childFragment as IFragment).template !== template;

    if (shouldCreateNew) {
        return createNewFragment(
            options,
            parentFragment,
            template,
            key,
            children
        );
    }

    const definedFragment = childFragment as IBaseFragment;
    if (definedFragment.isEmpty) {
        cacher.mark(parentFragment.cache, undefined);
        return definedFragment;
    }

    // from this point on, childFragment must be a non-empty fragment
    const realFragment = childFragment as IFragment;

    cacher.mark(parentFragment.cache, key);
    realFragment.children = children;
    return realFragment;
}

export function createNewFragment(
    options: IOptions,
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
): IFragment {
    const cacher = options.fragmentCacher;
    const newFragment: IFragment = {
        key,
        parent: parentFragment,
        element: undefined,
        cache: cacher.createCache(),
        template,
        children,
        onRemoved: undefined,
        isEmpty: false,
    };

    if (parentFragment !== undefined) {
        cacher.putChild(
            parentFragment.cache,
            newFragment,
        );
        cacher.mark(parentFragment.cache, key);
    }
    return newFragment;
}

export function createEmptyFragment(
    parentFragment: IFragment|undefined,
): EmptyFragment {
    return {
        isEmpty: true,
        parent: parentFragment,
        onRemoved: undefined,
    };
}

export function refresh(
    fragment: IFragment,
): void {
    if (fragment.element === undefined) {
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
            undefined
        );
    });
}


export function remove(
    fragment: IFragment,
): boolean {
    if (fragment.onRemoved === undefined) {
        return false;
    }
    fragment.onRemoved();
    return true;
}

export function fragmentVoid(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    const fragment = createFragment(
        options,
        parentFragment,
        template,
        key,
        children
    );
    if (fragment.isEmpty) {
        return undefined;
    }

    const realFragment = fragment as IFragment;
    realFragment.element = template(realFragment, props, children);
    return realFragment.element;
};

export function getBucket(fragment: IFragment): IBucket {
    if (fragment.bucket === undefined) {
        fragment.bucket = {};
    }
    return fragment.bucket;
}
