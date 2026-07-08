// Known hole: an instrumented function returning a lifted primitive into a
// native coercion site escapes the hook protocol — `valueOf` returns
// Lifted(5), native `+` sees an object and falls back to toString, so `r`
// becomes "[object Object]1" instead of 6. Tied to the ToPrimitive-for-objects
// TODO / function-return boundary.
var calls = 0;
var o = {
  valueOf: function () {
    calls++;
    return 5;
  },
};

var r = o + 1;

__assert__(r === 6);
__assert__(calls === 1);
