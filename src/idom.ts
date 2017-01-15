import {
    patchOuter,
} from 'incremental-dom';

export {
    elementOpen,
    elementClose,
    elementVoid,
    text,
    patchOuter,
} from 'incremental-dom';

import {
    Template,
} from './types';

import {
    createFragment,
} from './fragment';

import options from './options';

export function render(template: Template, parentDom: Element): void {
    const rootFragment = createFragment(
        options,
        null,
        template,
        null,
        null,
    );
    patchOuter(parentDom, function () {
        template(rootFragment, null, null);
    });
}
