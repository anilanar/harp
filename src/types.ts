export type Children = () => void;
export type OnRemoved = () => void;
export type OnRemoveFromCache = (fragment: Fragment) => void;

export interface IProps {}

export type Fragment = {
    bucket?: IBucket,
    cache: ICache,
    children: Children|null,
    element: Element|null,
    key: string|null,
    onRemoved: OnRemoved|null,
    parent: Fragment|null,
    template: Template,
};

export type Template = (
    parentFragment: Fragment,
    props: IProps|null,
    children: Children|null,
) => Element;


export interface IFragmentCacher {
    createCache(): ICache;
    getChild(cache: ICache, key: string|null): Fragment|null;
    putChild(cache: ICache, child: Fragment): string|null;
    mark(cache: ICache, key: string|null): void;
    clean(cache: ICache, onRemove: OnRemoveFromCache): void;
}

export interface IOptions {
    fragmentCacher: IFragmentCacher
}

export interface ICache {
}

export interface IBucket {
}
