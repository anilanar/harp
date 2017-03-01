export type Children = () => void;
export type OnRemoved = () => void;
export type OnRemoveFromCache = (fragment: IFragment) => void;

export interface IProps {}

export interface IBaseFragment {
    isEmpty: boolean,
    onRemoved: OnRemoved|undefined,
    parent: IFragment|undefined,
};

export interface IEmptyFragment {
    isEmpty: boolean,
    onRemoved: OnRemoved|undefined,
    parent: IFragment|undefined,
}

export interface IFragment extends IBaseFragment {
    bucket?: IBucket,
    cache: ICache,
    children: Children|undefined,
    element: Element|undefined,
    key: string|undefined,
    onRemoved: OnRemoved|undefined,
    parent: IFragment|undefined,
    template: Template,
    isEmpty: boolean,
}

export interface IRootFragment {
    bucket?: IBucket,
    cache: ICache,
    children: Children|undefined,
    element: Element|undefined,
    key: string|undefined,
    onRemoved: OnRemoved|undefined,
    parent: undefined,
    template: Template,
    isEmpty: false,
}

export interface ISubFragment {
    bucket?: IBucket,
    cache: ICache,
    children: Children|undefined,
    element: Element|undefined,
    key: string|undefined,
    onRemoved: OnRemoved|undefined,
    parent: IFragment,
    template: Template,
    isEmpty: false,
}

export type Template = (
    fragment: IFragment,
    props: IProps|undefined,
    children: Children|undefined,
) => Element|undefined;


export interface ICacheSystem {
    Cache: {new(): ICache};
    getChild(cache: ICache, key: string|undefined): IBaseFragment|undefined;
    putChild(cache: ICache, child: IBaseFragment): string|undefined;
    mark(cache: ICache, key: string|undefined): void;
    clean(cache: ICache, onRemove: OnRemoveFromCache|undefined): void;
    reset(cache: ICache): void;
}

export interface IFragmentSystem {
    createFragment(
        parentFragment: IFragment|undefined,
        template: Template,
        key: string|undefined,
        children: Children|undefined,
    ): IBaseFragment;

    createEmptyFragment(
        parentFragment: IFragment|undefined,
    ): IEmptyFragment;

    getBucket(fragment: IFragment): IBucket;

    fragmentOpen(
        parentFragment: IFragment|undefined,
        template: Template,
        key: string|undefined,
        children: Children|undefined,
        props: IProps|undefined,
    ): Element|undefined;

    fragmentClose(
        parentFragment: IFragment|undefined,
        template: Template,
        key: string|undefined,
        children: Children|undefined,
        props: IProps|undefined,
    ): Element|undefined;

    fragmentVoid(
        parentFragment: IFragment|undefined,
        template: Template,
        key: string|undefined,
        children: Children|undefined,
        props: IProps|undefined,
    ): Element|undefined;

    refresh(fragment: ISubFragment): void;

    skip(fragment: IFragment): Element|undefined;
}

export interface IDOM {
    elementOpen(
        name: string,
        key?: string,
        statics?: any[],
        ...args: any[],
    ): Element;

    elementClose(
        name: string,
    ): Element;

    elementVoid(
        name: string,
        key?: string,
        statics?: any[],
        ...args: any[],
    ): Element;

    text(value: string|number|boolean): Text;

    patchInner<T>(
        node: Element|DocumentFragment,
        fn: (data: T) => void,
        data?: T
    ): Node;

    patchOuter<T>(
        node: Element,
        fn: (data: T) => void,
        data?: T
    ): Node|null;

    currentPointer(): Node;
    skipNode(): void;
}

export interface IOptions {
    cacheSystem: ICacheSystem,
    fragmentSystem: IFragmentSystem,
    idom: IDOM,
}

export interface ICache {
}

export interface IBucket {
}
