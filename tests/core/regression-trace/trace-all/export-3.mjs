export { named as renamed } from 'data:text/javascript,export const named=5;';
export * as ns from 'data:text/javascript,export const value=8;';

import { named } from 'data:text/javascript,export const named=5;';
import * as importedNs from 'data:text/javascript,export const value=8;';

print(named + importedNs.value);
