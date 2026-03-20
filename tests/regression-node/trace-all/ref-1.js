
const { x: y = 33 } = { };

let getReferenceError = false;

try {
  x;
} catch (e) {
  getReferenceError = e instanceof ReferenceError;
}
assert(y === 33);
assert(getReferenceError, 'should get ReferenceError');
