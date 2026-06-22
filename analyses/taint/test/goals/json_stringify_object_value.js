// A tainted property VALUE inside an object must taint the serialized output.
// Exercises SerializeJSONObject + EnumerableOwnProperties (key enumeration) +
// SerializeJSONProperty recursion. The object path is the most under-modeled
// part today, so this is the load-bearing goal.
var v = 'secret';

__set_taint__(v);

var o = { k: v };

var out = JSON.stringify(o); // => {"k":"secret"}

__assert__(out === '{"k":"secret"}');
__assert__(__is_tainted__(out));
