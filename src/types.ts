export type Children = () => void;
export type OnRemoved = () => void;

interface Props {}
interface Statics {}

export type Fragment = {
    key: string,
    parent: Fragment,
    element: Element|null,
    cache: ICache,
    template: Template,
    children: Children|null,
    onRemoved: OnRemoved|null,
};

export type Template = (
    parentFragment: Fragment,
    statics: Statics,
    props: Props,
    children: Children|null,
) => Element;


export interface IFragmentCacher {
    createCache(): ICache;
    getChild(cache: ICache, key: string): Fragment|null;
    putChild(cache: ICache, child: Fragment): void;
    mark(cache: ICache, key: string): void;
    clean(cache: ICache): void;
}

export interface IOptions {
    fragmentCacher: IFragmentCacher
}

export interface ICache {
}
