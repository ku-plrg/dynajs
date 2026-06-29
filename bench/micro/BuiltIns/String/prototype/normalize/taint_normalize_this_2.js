// @type taint
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;
    var r = x.normalize('NFC');

    // @witness __test_taint__('x') => r[1]='x'
    // @witness __test_taint__('e'+U+0301) => r[1]='é' (NFC merges to one char)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('hello'));
