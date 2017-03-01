import * as cacheSystem from './cacher';
import * as fragmentSystem from './stateful-fragment';
import * as idom from 'incremental-dom';

import {IOptions} from './types';

const options: IOptions = {
    cacheSystem,
    fragmentSystem,
    idom,
};

export default options;
