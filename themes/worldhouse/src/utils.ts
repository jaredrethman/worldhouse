import { test } from './utils/test';

test();

if (module.hot) {
    module.hot.accept();
}