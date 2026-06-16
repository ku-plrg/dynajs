// @type concolic
// @target es5 array-length
// @feature builtin symbolic-array-length
// A symbolic array's length is itself symbolic (z3 Sequence theory: seq.len), so
// it is constrained only by what the path establishes. Reading a[2] forces the
// access bound 2 < a.length, hence a.length >= 3 is valid -> detected. Reading
// only b[0] forces just 0 < b.length, so b.length >= 3 is NOT implied -> clean.
// A concrete-only engine reports b.length (== 3) >= 3 as detected: the wrong
// answer, which is what makes the second case discriminating.

var a = __symbolic__("a", [10, 20, 30]);
if (a[2] === 30) {
  __symbolic_assert__(a.length >= 3, true);
}

var b = __symbolic__("b", [1, 2, 3]);
if (b[0] === 1) {
  __symbolic_assert__(b.length >= 3, false);
}
