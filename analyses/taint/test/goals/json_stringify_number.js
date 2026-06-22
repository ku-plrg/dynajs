// A tainted number must taint its serialized digits. Exercises
// SerializeJSONProperty's number branch (finite -> ToString), confirming taint
// survives the number-to-string conversion inside the model.
var n = 42;

__set_taint__(n);

var out = JSON.stringify(n); // => "42"

__assert__(out === '42');
__assert__(__is_tainted__(out));
