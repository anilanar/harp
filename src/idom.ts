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

import options from './options';
const {
    cacheSystem: C,
    fragmentSystem: F,
} = options;

export function render(template: Template, parentDom: Element): void {
    const rootFragment = F.createFragment(
        undefined,
        template,
        undefined,
        undefined,
    ) as IFragment;
    patch(parentDom, function () {
        F.fragmentVoid(
            rootFragment,
            template,
            undefined,
            undefined,
            undefined,
        );
        C.clean(rootFragment.cache, undefined);
    });
}
