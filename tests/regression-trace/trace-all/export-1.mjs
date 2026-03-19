import value, { named as alias } from 'data:text/javascript,export default 40;export const named=2;';

const ns = await import('data:text/javascript,export const extra=5;export default 7;');
const total = value + alias + ns.extra;

export { alias as named };
export default total;

print(total);
