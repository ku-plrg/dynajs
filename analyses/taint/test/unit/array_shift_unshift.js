// shift/unshift on a real Array run natively (they only move elements), so a
// tainted element keeps its taint through both, and clean elements stay clean.
var x = 'asdf';
__set_taint__(x);

var q = [x, 'clean'];
var head = q.shift();
__assert__(__is_tainted__(head));
__assert__(!__is_tainted__(q[0]));

q.unshift(x);
__assert__(__is_tainted__(q[0]));
__assert__(!__is_tainted__(q[1]));
console.log('ok');
