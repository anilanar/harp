import * as idom from 'incremental-dom';

export const elementOpen = idom.elementOpen;

export const text = idom.text;

export const elementClose = idom.elementClose;

export const elementVoid = idom.elementVoid;

export const componentOpen = (parentNode, Component, key, statics, props) => {
    const node = parentNode.getNode(Component, key);
    unmarkChildren(node);

    if (!node.shouldRender) {
        return;
    }

    Component[0](props, node);
    unmountUnmarkedChildren(node);
};

export const componentClose = (parentNode, Component, key, statics, props) => {
    const node = parentNode.getNode(Component, key);

    if (node.shouldRender) {
        Component[1](props, node);
    }
};

export const componentVoid = (...args) => {
    componentOpen(...args);
    componentClose(...args);
};

export const render = (RootComponent, rootElement) => {
    const node = createRootNode(RootComponent, rootElement);
    node.refresh();
    return node;
};

function unmount(parentNode, node) {
    if (node.onUnmount != null) {
        node.onUnmount();
    }
}

function unmarkChildren(node) {
    for (const key in node.children) {
        if (node.children[key] != null) {
            node.children[key].marked = false;
        }
    }
}

function unmountUnmarkedChildren(node) {
    for (const key in node.children) {
        const child = node.children[key];
        if (child != null) {
            if (child.marked === false) {
                unmount(node, child)
                node.children[key] = null;
            }
        }
    }
}

const getNode = (node, refresh) => (Component, key) => {
    const childNode = node.children[key];
    if (childNode != null && Component === Component) {
        childNode.marked = true;
        return childNode;
    }

    const newNode = createNode(Component, key, refresh);
    node.children[key] = newNode;
    return newNode;
};

function createNode(Component, key, refresh) {
    const node = {};
    node.children = {};
    node.shouldRender = true;
    node.refresh = refresh;
    node.getNode = getNode(node, refresh);
    node.Component = Component;
    node.marked = false;
    return node;
}

const createRefresh = (Component, element, node) => () => {
    idom.patch(element, () => {
        componentVoid(node, Component, null, null, null);
    });
};

function createRootNode(RootComponent, rootElement) {
    const node = {};
    node.children = {};
    node.shouldRender = true;
    node.refresh = createRefresh(RootComponent, rootElement, node);
    node.getNode = getNode(node, node.refresh);
    return node;
}
