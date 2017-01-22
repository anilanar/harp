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


export interface IFragmentCacher {
    Cache: {new(): ICache};
    getChild(cache: ICache, key: string|undefined): IBaseFragment|undefined;
    putChild(cache: ICache, child: IBaseFragment): string|undefined;
    mark(cache: ICache, key: string|undefined): void;
    clean(cache: ICache, onRemove: OnRemoveFromCache|undefined): void;
    reset(cache: ICache): void;
}

export interface IOptions {
    fragmentCacher: IFragmentCacher
}

export interface ICache {
}

export interface IBucket {
}
