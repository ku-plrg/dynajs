// A tainted array element must taint the serialized output. Exercises
// SerializeJSONArray + SerializeJSONProperty recursion over numeric indices.
var v = 'secret';

__set_taint__(v);

var a = [v];

var out = JSON.stringify(a); // => ["secret"]

__assert__(out === '["secret"]');
__assert__(__is_tainted__(out));
