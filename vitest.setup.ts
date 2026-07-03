import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

import '@testing-library/jest-dom/vitest';

// `@testing-library/react`'s built-in auto-cleanup only registers itself
// when it finds a global `afterEach` at import time. This project runs
// vitest with `globals: false` (explicit imports everywhere), so that
// auto-registration never fires and DOM trees leak across tests within the
// same file. Register cleanup explicitly instead.
afterEach(() => {
    cleanup();
});
