import {createStore} from 'redux';
import shallowequal from 'shallowequal';

const COMPONENT_INSTANCE = 'HARP_COMPONENT_INSTANCE';
const OPEN = 0;
const CLOSE = 1;

export const RECEIVE_PROPS = 'RECEIVE_PROPS';

const defaultReducer = (state, action) => {
    if (action.type !== RECEIVE_PROPS) {
        return state;
    }
    return Object.assign({}, state, action.payload);
};

export const createComponent = (
    template,
    reducer = defaultReducer,
    middleware,
    ComponentClass,
) => {
    // component is a functional component that takes props and node
    // which sadly keeps its own state in the node.
    return [(props, node) => {
        const componentInstance = getComponentInstance(
            node,
            template,
            reducer,
            middleware,
            ComponentClass,
        );
        componentInstance.renderOpen(props);
    }, (props, node) => {
        const componentInstance = getComponentInstance(
            node,
            template,
            reducer,
            middleware,
            ComponentClass,
        );
        componentInstance.renderClose(props);
    }];
    return component;
};

function getComponentInstance(
    node,
    template,
    reducer,
    middleware,
    ComponentClass,
) {
    const Cls = ComponentClass != null
        ? ComponentClass
        : Component;

    const store = middleware == null
        ? createStore(reducer)
        : createStore(reducer, undefined, middleware);

    const instance = node[COMPONENT_INSTANCE] != null
        ? node[COMPONENT_INSTANCE]
        : new Cls(
            node,
            template,
            store,
        );
    node[COMPONENT_INSTANCE] = instance;
    return instance;
}

export class Component {
    constructor(node, template, store) {
        this.node = node;
        this.template = template;
        this.store = store;
        this.isFirstRender = true;
        this.isDirty = false;
        this.state = store.getState();
        this.actions = {};
        node.onUnmount = () => {
            this.componentWillUnmount();
        };
    }

    dispatch(action) {
        const oldState = this.state;
        this.store.dispatch(action);
        const newState = this.store.getState();

        if (action.type === RECEIVE_PROPS) {
            receiveProps(this, oldState, newState);
        } else {
            update(this, oldState, newState);
        }
    }

    setActions(actions) {
        this.actions = Object.keys(actions).reduce((result, name) => {
            result[name] = (...args) => {
                this.dispatch(actions[name](...args));
            };
            return result;
        }, {});
    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    componentWillUpdate() {
    }

    componentDidUpdate() {
    }

    shouldComponentUpdate(nextState) {
        return !shallowequal(this.state, nextState);
    }

    render(props) {
        const isFirstRender = this.isFirstRender;
        this.dispatch({
            type: RECEIVE_PROPS,
            payload: props,
        });
    }

    renderOpen(props) {
        this.dispatch({
            type: RECEIVE_PROPS,
            payload: props,
        });
    }

    // state and props cannot change between open and close
    // so renderClose can rely on its last state
    renderClose() {
        renderTemplate(this, CLOSE, this.state);
    }
}

function renderTemplate(component, type, state) {
    component.template[type]({
        state: state,
        actions: component.actions,
    }, component.node);
}

function firstReceiveProps(component, state) {
    component.state = state;
    component.componentWillMount();
    renderTemplate(component, OPEN, state);
    component.componentDidMount();
    component.isFirstRender = false;
}

function receiveProps(component, oldState, newState) {
    if (component.isFirstRender === true) {
        firstReceiveProps(component, newState);
        return;
    }

    if (!component.shouldComponentUpdate(newState)) {
        renderTemplate(component, OPEN, oldState);
        return;
    }

    component.componentWillUpdate(newState);
    component.state = newState;
    renderTemplate(component, OPEN, newState);
    component.componentDidUpdate(oldState);
}

function update(component, oldState, newState) {
    if (!component.shouldComponentUpdate(newState)) {
        return;
    }
    component.node.refresh();
}
