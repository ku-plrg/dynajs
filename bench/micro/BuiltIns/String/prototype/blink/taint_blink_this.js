// @type taint
// @target es6+ String.prototype.blink
// @feature builtin blink
// @done

const BLINK = "<blink>";

function __test_taint__(tainted) {
    var x0 = 'a';
    var x = tainted + x0;
    var r = x.blink();

    // @witness always r[0]='<' (tag char, not from receiver)
    __assert_taint__(r[0], false);

    // @witness __test_taint__('x') => r[7]='x' (tainted receiver char at index 7)
    __assert_taint__(r[7], true);

    // @witness always r[r.length-BLINK.length-2]='a' (tag char, not from receiver)
    __assert_taint__(r[r.length - BLINK.length - 2], false);

    // @witness always r[r.length-1]='>' (tag close char, always clean)
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__('hello'));
