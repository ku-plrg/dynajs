// JSON.stringify of a tainted string must yield a tainted result string.
// Exercises: INTRINSICS_JSON_stringify -> SerializeJSONProperty (string branch)
//            -> QuoteJSONString. The coarse "did taint reach the output at all"
//            check; positional precision is asserted separately.
var s = 'abc';

__set_taint__(s);

var out = JSON.stringify(s); // => "abc"  (5 chars: quote a b c quote)

__assert__(out === '"abc"');
__assert__(__is_tainted__(out));
