import {
    patch,
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
    fragmentVoid,
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
    patch(parentDom, function () {
        fragmentVoid(
            rootFragment,
            template,
            undefined,
            undefined,
            undefined,
        );
        options.fragmentCacher.clean(rootFragment.cache, undefined);
    });
}
