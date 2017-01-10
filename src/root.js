import {
    elementOpen,
    elementClose,
    elementVoid,
    componentOpen,
    componentClose,
    componentVoid,
    text,
    render,
} from './idom';

import {
    createComponent,
    Component as ComponentClass,
    RECEIVE_PROPS,
} from './component';

const RootComponent = [({state, actions}, ref) => {
    elementOpen('div', 'root-div', ['class', 'root-div']);
    if (!state.hidden) {
        componentOpen(ref, ChildComponent, 'component', null, {name: `Anil ${state.count}`});
        elementOpen('div', 'nested-div', ['class', 'nested-div']);
        elementClose('div');
        componentClose(ref, ChildComponent, 'component');
    }
    elementClose('div');
    elementOpen('button', null, ['onclick', actions.toggle]);
    text('Toggle');
    elementClose('button');
}, () => {}];

class ChildComponentClass extends ComponentClass {
    componentDidMount() {
        super.componentDidMount();
        console.log('Component did mount');
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        console.log('Component will unmount');
    }
}

const ChildComponent = createComponent([
    ({state}) => {
        elementOpen('div', 'my-div', ['className', 'my-div']);
        text(`Hello ${state.name}`);
    },
    () => {
        elementClose('div');
    },
], undefined, undefined, ChildComponentClass);

const reducer = (
    state = {
        count: 0,
        hidden: false,
    },
    action,
) => {
    switch(action.type) {
        case RECEIVE_PROPS:
            return Object.assign(state, action.payload);
        case 'INCREMENT':
            return Object.assign({}, state, {count: state.count + 1});
        case 'TOGGLE':
            return Object.assign({}, state, {
                hidden: !state.hidden
            });
        default:
            return state;
    }
};

class RootComponentClass extends ComponentClass {
    constructor(...args) {
        super(...args);
        this.setActions({
            toggle: () => ({
                type: 'TOGGLE',
            }),
        });
    }
    componentDidMount() {
        super.componentDidMount();
        setInterval(() => {
            this.dispatch({
                type: 'INCREMENT',
            });
        }, 1000);
    }
}

render(
    createComponent(
        RootComponent,
        reducer,
        undefined,
        RootComponentClass,
    ),
    document.getElementById('harp'),
);
