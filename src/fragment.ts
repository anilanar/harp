import {
    patchOuter,
} from './idom';

import {
    Children,
    Template,
    Fragment,
    IOptions,
} from './types';

import * as fragmentCacher from './default-fragment-cacher';

import * as dedent from 'dedent-js';

const options: IOptions = {
    fragmentCacher,
};

function createFragment<ParentProps, Props>(
    options: IOptions,
    parentFragment: Fragment,
    template: Template,
    key: string,
    children: Children|null,
): Fragment {
    return {
        key,
        parent: parentFragment,
        element: null,
        cache: options.fragmentCacher.createCache(),
        template,
        children,
        onRemoved: null,
    };
}

/**
 * Creates a fragment or retrieves it from the cache. Cache strategy can be no-op,
 * never caching fragments. In that case, fragments would always be created.
 * Thus performance of this function heavily depends on the cache strategy.
 */
export function getFragment<ParentProps, Props>(
    options: IOptions,
    parentFragment: Fragment,
    template: Template,
    key: string,
    children: Children|null,
): Fragment {
    const {fragmentCacher: cacher} = options;
    const childFragment = cacher.getChild(
        parentFragment.cache,
        key,
    );
    if (childFragment != null && childFragment.template === template) {
        cacher.mark(parentFragment.cache, key);
        childFragment.children = children;
        return childFragment;
    }
    const newFragment = createFragment(
        options,
        parentFragment,
        template,
        key,
        children,
    );
    return newFragment;
}

export function refresh<Props>(
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
        );
    });
}


export function remove<Props>(
    fragment: Fragment,
): boolean {
    if (fragment.onRemoved == null) {
        return false;
    }
    fragment.onRemoved();
    return true;
}

export function fragmentVoid<Props>(
    parentFragment: Fragment,
    template: Template,
    key: string,
    children: Children|null,
    statics?: Array<string>,
    props?: Props,
): HTMLElement|null {
    const fragment = getFragment(
        options,
        parentFragment,
        template,
        key,
        children
    );
    //node.renderInfo.renderedKeys.clear();

    //if (node.renderInfo.shouldRender === false) {
    //    return null;
    //}

    if (statics != null && props != null) {
        template(fragment, statics, props, children);
    }
    return null;
};
