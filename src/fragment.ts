import {
    currentPointer,
    patchOuter,
    skipNode,
} from 'incremental-dom';

import {
    Children,
    IBaseFragment,
    IBucket,
    ICache,
    IEmptyFragment,
    IFragment,
    IOptions,
    IProps,
    ISubFragment,
    OnRemoved,
    Template,
} from './types';

import options from './options';

import {dedent} from './shared';

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

export class Fragment {
    bucket?: IBucket;
    cache: ICache;
    children: Children|undefined;
    element: Element|undefined;
    isEmpty: false;
    key: string|undefined;
    onRemoved: OnRemoved|undefined;
    parent: IFragment|undefined;
    template: Template|undefined;

    constructor(
        cache: ICache,
        children: Children|undefined,
        isEmpty: boolean,
        key: string|undefined,
        parent: IFragment|undefined,
        template: Template|undefined,
    ) {
        this.key = key;
        this.parent = parent;
        this.element = undefined;
        this.cache = cache;
        this.template = template;
        this.children = children;
        this.onRemoved = undefined;
        this.isEmpty = false;
    }
}

export function createNewFragment(
    options: IOptions,
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
): IFragment {
    const cacher = options.fragmentCacher;
    const newFragment = new Fragment(
        new cacher.Cache(),
        children,
        false,
        key,
        parentFragment,
        template,
    ) as IFragment;

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
): IEmptyFragment {
    return new Fragment(
        new options.fragmentCacher.Cache(),
        undefined,
        true,
        undefined,
        parentFragment,
        undefined,
    ) as IEmptyFragment;
}

export function refresh(
    fragment: ISubFragment,
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
        options.fragmentCacher.reset(fragment.parent.cache);
    });
}

export function skip(fragment: IFragment): Element|undefined {
    if (currentPointer() !== fragment.element) {
        return undefined;
    }
    skipNode();
    return fragment.element;
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
    options.fragmentCacher.clean(realFragment.cache, undefined);
    return realFragment.element;
};

export function getBucket(fragment: IFragment): IBucket {
    if (fragment.bucket === undefined) {
        fragment.bucket = {};
    }
    return fragment.bucket;
}
