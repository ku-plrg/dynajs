// @type taint
// @target es6+ String.prototype.blink
// @feature builtin blink
// @done

const BLINK = "<blink>";

function __test_taint__(tainted) {
    var x0 = 'a';
    var x = tainted + x0;
    var r = x.blink();

    // @witness always r[r.length-BLINK.length-2]='a' (tag char, not from receiver)
    __assert_taint__(r[r.length - BLINK.length - 2], false);
}

__test_taint__(__set_taint__('hello'));
