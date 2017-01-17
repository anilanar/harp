export type Children = () => void;
export type OnRemoved = () => void;
export type OnRemoveFromCache = (fragment: IFragment) => void;

export interface IProps {}

export interface IBaseFragment {
    parent: IFragment|undefined,
    isEmpty: boolean,
    onRemoved: OnRemoved|undefined,
};

export type EmptyFragment = {
    parent: IFragment,
    isEmpty: true,
    onRemoved: OnRemoved|undefined,
};

export interface IFragment extends IBaseFragment {
    bucket?: IBucket,
    cache: ICache,
    children: Children|undefined,
    element: Element|undefined,
    key: string|undefined,
    onRemoved: OnRemoved|undefined,
    parent: IFragment|undefined,
    template: Template,
    isEmpty: false,
}

export type RootFragment = {
    bucket?: IBucket,
    cache: ICache,
    children: Children|undefined,
    element: Element|undefined,
    key: string|undefined,
    onRemoved: OnRemoved|undefined,
    parent: undefined,
    template: Template,
    isEmpty: false,
};

export type Fragment = {
    bucket?: IBucket,
    cache: ICache,
    children: Children|undefined,
    element: Element|undefined,
    key: string|undefined,
    onRemoved: OnRemoved|undefined,
    parent: IFragment,
    template: Template,
    isEmpty: false,
};

export type Template = (
    parentFragment: IFragment,
    props: IProps|undefined,
    children: Children|undefined,
) => Element;


export interface IFragmentCacher {
    createCache(): ICache;
    getChild(cache: ICache, key: string|undefined): IBaseFragment|undefined;
    putChild(cache: ICache, child: IBaseFragment): string|undefined;
    mark(cache: ICache, key: string|undefined): void;
    clean(cache: ICache, onRemove: OnRemoveFromCache): void;
}

export interface IOptions {
    fragmentCacher: IFragmentCacher
}

export interface ICache {
}

export interface IBucket {
}
