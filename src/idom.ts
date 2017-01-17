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
    IFragment,
    Template,
} from './types';

import {
    createFragment,
} from './fragment';

import options from './options';

export function render(template: Template, parentDom: Element): void {
    const rootFragment = createFragment(
        options,
        undefined,
        template,
        undefined,
        undefined,
    ) as IFragment;
    patchOuter(parentDom, function () {
        template(rootFragment, undefined, undefined);
    });
}
