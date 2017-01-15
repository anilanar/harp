import * as c from '../cacher';
import {times} from 'lodash';

describe('Cacher', () => {
    let cache;

    beforeEach(() => cache = c.createCache());

    it('should set tracker indices to 0', () => {
        expect(cache.getIndex).toBe(0);
        expect(cache.markIndex).toBe(0);
    });

    it('should put and get unkeyed child', () => {
        const fragment = {};
        c.putChild(cache, fragment);
        expect(c.getChild(cache, null)).toBe(fragment);
    });

    it('should put and get unkeyed children in the same order', () => {
        const fragments = times(5).map(() => ({}));
        fragments.forEach(f => c.putChild(cache, f));

        const cachedFragments = times(5).map(() => c.getChild(cache, null));
        cachedFragments.forEach((c, idx) => expect(c).toBe(fragments[idx]));
    });

    it('should put null as unkeyed child', () => {
        c.putChild(cache, null);
        expect(c.getChild(cache, null)).toBe(null);
    });

    it('should put null as unkeyed child in the middle', () => {
        const fragments = [{}, null, {}];
        fragments.forEach(f => c.putChild(cache, f));

        const cachedFragments = times(3).map(() => c.getChild(cache, null));
        cachedFragments.forEach((c, idx) => expect(c).toBe(fragments[idx]));
    });

    it('should throw an error marking fragment without caching anything', () => {
        expect(() => c.mark(cache, null)).toThrow();
    });

    it('should throw an error marking more fragments than cached', () => {
        c.putChild(cache, {});
        expect(
            () => times(2).forEach(() => c.mark(cache, null))
        ).toThrow();
    });

});
