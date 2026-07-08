// Known hole: forInOfObject unlifts a lifted string so native iteration
// works, but the yielded chars are raw — per-char info is lost (no iterator
// model yet; each char should carry substring-of-source info).
var s = 'ab';
__set_taint__(s);

var first = '';
for (var c of s) {
  first = c;
  break;
}
__assert__(__is_tainted__(first));
