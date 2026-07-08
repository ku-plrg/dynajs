// Negative case: a clean input must not produce tainted output. Guards against
// the model over-tainting (e.g. marking the whole result tainted regardless of
// input, or an unscoped info-loss marker leaking onto JSON.stringify results).
var s = 'abc';

var out = JSON.stringify(s);

__assert__(out === '"abc"');
__assert__(!__is_tainted__(out));
