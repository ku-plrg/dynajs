// A lifted primitive RHS of for-of is a plain object (not iterable), so the
// forInOfObject hook must unlift it before native iteration.
var s = 'ab';
__set_taint__(s);

var out = '';
for (var c of s) {
  out = out + c;
}
__assert__(out === 'ab');

var arr = [1, 2];
var sum = 0;
for (var v of arr) {
  sum = sum + v;
}
__assert__(sum === 3);
