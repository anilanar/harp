import {
    Children,
    IBaseFragment,
    IBucket,
    ICache,
    IEmptyFragment,
    IFragment,
    IProps,
    ISubFragment,
    OnRemoved,
    Template,
} from './types';

import options from './options';
import {dedent, throwError} from './shared';

const {cacheSystem, idom} = options;


/**
 * Creates a fragment or retrieves it from the cache. Cache strategy can be no-op,
 * never caching fragments. In that case, fragments would always be created.
 * Thus performance of this function heavily depends on the cache strategy.
 */
export function createFragment(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
): IBaseFragment {
    const childFragment = getCachedFragment(
        parentFragment,
        template,
        key
    );

    if (childFragment === undefined) {
        return createNewFragment(
            parentFragment,
            template,
            key,
            children
        );
    }

    // parent fragment must be defined if it has a child fragment
    parentFragment = parentFragment as IFragment;

    if (childFragment.isEmpty) {
        cacheSystem.mark(parentFragment.cache, undefined);
        return childFragment;
    }

    // from this point on, childFragment must be a non-empty fragment
    const realFragment = childFragment as IFragment;

    cacheSystem.mark(parentFragment.cache, key);
    realFragment.children = children;
    return realFragment;
}

function getCachedFragment(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
): IBaseFragment|undefined {
    if (parentFragment === undefined) {
        return undefined;
    }

    let childFragment = cacheSystem.getChild(
        parentFragment.cache,
        key,
    );

    const isBusted = childFragment === undefined
        || !childFragment.isEmpty
        && (childFragment as IFragment).template !== template;

    if (isBusted) {
        childFragment = undefined;
    }

    return childFragment;
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

function createNewFragment(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
): IFragment {
    const newFragment = new Fragment(
        new cacheSystem.Cache(),
        children,
        false,
        key,
        parentFragment,
        template,
    ) as IFragment;

    if (parentFragment !== undefined) {
        cacheSystem.putChild(
            parentFragment.cache,
            newFragment,
        );
        cacheSystem.mark(parentFragment.cache, key);
    }
    return newFragment;
}

export function createEmptyFragment(
    parentFragment: IFragment|undefined,
): IEmptyFragment {
    return new Fragment(
        new cacheSystem.Cache(),
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
        return throwError(
            dedent`Cannot refresh the node due to it lacking its
            element. Either it's not mounted yet or it's already unmounted.`
        );
    }

    idom.patchOuter(fragment.element, function () {
        fragment.element = fragmentVoid(
            fragment.parent,
            fragment.template,
            fragment.key,
            fragment.children,
            undefined
        );
        cacheSystem.reset(fragment.parent.cache);
    });
}

export function skip(fragment: IFragment): Element|undefined {
    if (idom.currentPointer() !== fragment.element) {
        return undefined;
    }
    idom.skipNode();
    return fragment.element;
}


export function fragmentOpen(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    throwError(`fragmentOpen is not supported`);
    return undefined;
}

export function fragmentClose(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    throwError(`fragmentClose is not supported`);
    return undefined;
}

export function fragmentVoid(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    const fragment = createFragment(
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
    cacheSystem.clean(realFragment.cache, undefined);
    return realFragment.element;
};

export function getBucket(fragment: IFragment): IBucket {
    if (fragment.bucket === undefined) {
        fragment.bucket = {};
    }
    return fragment.bucket;
}
