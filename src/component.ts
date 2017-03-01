import {
    Action,
    createStore,
    Reducer,
    StoreEnhancer,
    Store,
} from 'redux';

import {
    Children,
    ISubFragment,
    IFragment,
    IProps,
    Template,
} from './types';

import options from './options';
const {fragmentSystem} = options;

export const RECEIVE_PROPS = 'RECEIVE_PROPS';

type Bucket<P, S> = {
    instance: Component<P, S>,
}

const defaultReducer = <P, S extends P>(
    state: S,
    action: {type: string, payload: P},
): S => {
    if (action.type !== RECEIVE_PROPS) {
        return state;
    }
    return Object.assign({}, state, action.payload);
};

export function createComponent<P, S extends P, C extends Component<P, S>>(
    ComponentCls: {new(fragment: IFragment, store: Store<S>): C},
    reducer: Reducer<S> = defaultReducer,
    enhancer?: StoreEnhancer<S>,
): Template {
    return (
        fragment: IFragment,
        props: IProps|undefined,
        children: Children|undefined,
    ): Element|undefined => {
        const bucket = fragmentSystem.getBucket(fragment) as Bucket<P, S>;
        if (bucket.instance === undefined) {
            const store = enhancer === undefined
                ? createStore(reducer)
                : createStore(reducer, enhancer);
            bucket.instance = new ComponentCls(fragment, store);
        }

        return bucket.instance.update(props as P, children);
    };
}

function isShallowEqual(
    a: {[key: string]: any},
    b: {[key: string]: any},
): boolean {
  for (let i in a) if (!(i in b)) return true;
  for (let i in b) if (a[i] !== b[i]) return true;
  return false;
}

export abstract class Component<P, S> {
    protected fragment: ISubFragment;
    private isFirstRender: boolean;
    private store: Store<S>;
    private state: S;
    private props: P;

    constructor(
        fragment: ISubFragment,
        store: Store<S>,
    ) {
        this.fragment = fragment;
        this.store = store;
        this.state = store.getState();
        this.isFirstRender = true;
    }

    protected dispatch<A extends Action>(action: A): void {
        this.store.dispatch(action);
        fragmentSystem.refresh(this.fragment);
    }

    protected componentWillMount():void {}
    protected componentDidMount():void {}
    protected componentWillUnmount():void {}
    protected componentWillUpdate(nextProps: P, nextState: S): void {}
    protected componentDidUpdate(oldProps: P, oldState: S): void {}

    protected shouldComponentUpdate(nextProps: P, nextState: S): boolean {
        return !isShallowEqual(this.props, nextProps)
            || !isShallowEqual(this.state, nextState);
    }

    update(nextProps: P = ({} as P), children: Children|undefined): Element|undefined {
        if (this.isFirstRender) {
            this.props = nextProps;
            this.componentWillMount();
            const element = this.render();
            this.componentDidMount();
            this.isFirstRender = false;
            return element;
        }

        const prevProps = this.props;
        const nextState = this.store.getState();
        const prevState = this.state;

        if (!this.shouldComponentUpdate(nextProps, nextState)) {
            this.props = nextProps;
            this.state = nextState;
            return fragmentSystem.skip(this.fragment);
        }

        this.componentWillUpdate(nextProps, nextState);
        this.props = nextProps;
        this.state = nextState;

        const element = this.render();
        this.componentDidUpdate(prevProps, prevState);

        return element;
    }

    abstract render(): Element;
}
