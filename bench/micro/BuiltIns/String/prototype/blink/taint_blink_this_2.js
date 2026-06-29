// @type taint
// @target es6+ String.prototype.blink
// @feature builtin blink
// @done

const BLINK = "<blink>";

function __test_taint__(tainted) {
    var x0 = 'a';
    var x = tainted + x0;
    var r = x.blink();

    // @witness __test_taint__('x') => r[7]='x' (tainted receiver char at index 7)
    __assert_taint__(r[7], true);
}

__test_taint__(__set_taint__('hello'));
