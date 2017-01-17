import * as c from '../cacher';
import {
    intersection,
    times,
} from 'lodash';

import options from '../options';
import {
    createEmptyFragment,
    createNewFragment,
} from '../fragment';

function newFragment(key, props) {
    return Object.assign(
        createNewFragment(
            options,
            undefined,
            () => {},
            key,
            undefined
        ),
        props
    );
}

function emptyFragment() {
    return createEmptyFragment();
}

describe('Cacher', () => {
    let cache;

    beforeEach(() => cache = c.createCache());

    it('should set tracker numbers to 0', () => {
        expect(cache.getIndex).toBe(0);
        expect(cache.markIndex).toBe(0);
        expect(cache.suggestedCount).toBe(0);
    });

    it('should throw an error on putting an invalid fragment', () => {
        expect(() => c.putChild(cache, null)).toThrow();
        expect(() => c.putChild(cache, undefined)).toThrow();
        expect(() => c.putChild(cache, false)).toThrow();
        expect(() => c.putChild(cache, true)).toThrow();
        expect(() => c.putChild(cache, 'string')).toThrow();
        expect(() => c.putChild(cache, {})).toThrow();
    });

    describe('unkeyed', () => {
        it('should put and get child', () => {
            const fragment = newFragment();
            c.putChild(cache, fragment);
            expect(c.getChild(cache, undefined)).toBe(fragment);
        });

        it('should put and get children in the same order', () => {
            const fragments = times(5).map(() => newFragment());
            fragments.forEach(f => c.putChild(cache, f));

            const cachedFragments = times(5).map(() => c.getChild(cache, undefined));
            cachedFragments.forEach((c, idx) => expect(c).toBe(fragments[idx]));
        });

        it('should put empty as child', () => {
            const fragment = emptyFragment();
            c.putChild(cache, fragment);
            expect(c.getChild(cache, undefined)).toBe(fragment);
        });

        it('should put undefined as child in the middle', () => {
            const fragments = [newFragment(), emptyFragment(), newFragment()];
            fragments.forEach(f => c.putChild(cache, f));

            const cachedFragments = times(3).map(() => c.getChild(cache, undefined));
            cachedFragments.forEach((c, idx) => expect(c).toBe(fragments[idx]));
        });

        it('should throw an error marking fragment without caching anything', () => {
            expect(() => c.mark(cache, undefined)).toThrow();
        });

        it('should throw an error marking more fragments than cached', () => {
            c.putChild(cache, newFragment());
            expect(
                () => times(2).forEach(() => c.mark(cache, undefined))
            ).toThrow();
        });

        it('should not throw when marking an empty fragment', () => {
            c.putChild(cache, emptyFragment());
            expect(() => c.mark(cache, undefined)).not.toThrow();
        });

        it('should not unmount a single marked fragment', () => {
            const fragment = newFragment();
            c.putChild(cache, fragment);
            c.mark(cache, undefined);

            let didUnmount = false;
            c.clean(cache, () => {
                didUnmount = true;
            });

            expect(didUnmount).toBe(false);
            expect(c.getChild(cache, undefined)).toBe(fragment);
        });

        it('should unmount a single unmarked fragment', () => {
            const fragment = newFragment();
            c.putChild(cache, fragment);

            let didUnmount = false;
            c.clean(cache, () => {
                didUnmount = true;
            });

            expect(didUnmount).toBe(true);
            expect(c.getChild(cache, undefined)).toBe(undefined);
        });

        it('should unmount multiple fragments', () => {
            const fragments = times(5).map(i => newFragment());
            fragments.forEach(f => c.putChild(cache, f));

            c.mark(cache, undefined);
            times(3).forEach(() => c.skip(cache));
            c.mark(cache, undefined);

            c.clean(cache, undefined);

            const expected = [fragments[0], fragments[4]];
            const received = times(2).map(() => c.getChild(cache, undefined));
            expect(intersection(expected, received)).toHaveLength(2);
        });

        it('should unmount fragments at boundaries', () => {
            const fragments = times(5).map(i => newFragment());
            fragments.forEach(f => c.putChild(cache, f));

            c.skip(cache);
            times(3).forEach(() => c.mark(cache, undefined));
            c.skip(cache);

            c.clean(cache, undefined);

            const expected = [fragments[1], fragments[2], fragments[3]];
            const received = times(3).map(() => c.getChild(cache, undefined));
            expect(intersection(expected, received)).toHaveLength(3);
        });

        it('should unmount from the tail of children list', () => {
            const fragments = times(5).map(i => newFragment());
            fragments.forEach(f => c.putChild(cache, f));

            times(3).forEach(() => c.mark(cache, undefined));

            c.clean(cache, undefined);

            const expected = [fragments[0], fragments[1], fragments[2]];
            const received = times(3).map(() => c.getChild(cache, undefined));
            expect(intersection(expected, received)).toHaveLength(3);
        });
    });
});
