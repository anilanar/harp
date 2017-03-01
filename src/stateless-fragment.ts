import {
    Children,
    IBaseFragment,
    IBucket,
    IEmptyFragment,
    IFragment,
    IOptions,
    IProps,
    ISubFragment,
    Template,
} from './types';

import {throwError} from './shared';

import options from './options';
const {idom} = options;

class Fragment {
    element: Element;
    template: Template;
    props: IProps;
    constructor(
        element: Element,
        template: Template,
        props: IProps,
    ) {
        this.element = element;
        this.template = template;
        this.props = props;
    }
}

export function createFragment(
    options: IOptions,
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
): IBaseFragment {
    return parentFragment as IBaseFragment;
}

export function createEmptyFragment(
    parentFragment: IFragment|undefined,
): IEmptyFragment {
    return parentFragment as IBaseFragment;
}

export function getBucket(
    fragment: IFragment,
): IBucket {
    return throwError('Buckets are not supported');
}

export function fragmentOpen(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    template(parentFragment as IFragment, props, children);
    return undefined;
}

export function fragmentClose(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    template(parentFragment as IFragment, props, children);
    return undefined;
}

export function fragmentVoid(
    parentFragment: IFragment|undefined,
    template: Template,
    key: string|undefined,
    children: Children|undefined,
    props: IProps|undefined,
): Element|undefined {
    fragmentOpen(
        parentFragment,
        template,
        key,
        children,
        props,
    );
    fragmentClose(
        parentFragment,
        template,
        key,
        children,
        props,
    );
    return undefined;
}

export function refresh(fragment: ISubFragment): void {
    const realFragment = (fragment as any as Fragment);
    idom.patchInner(fragment.element as Element, function () {
        fragmentVoid(
            fragment,
            realFragment.template,
            undefined,
            undefined,
            realFragment.props,
        );
    });
}

export function skip(fragment: IFragment): Element|undefined {
    return throwError('skip is not supported');
}
