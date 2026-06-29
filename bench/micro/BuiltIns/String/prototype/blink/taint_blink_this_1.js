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
}

__test_taint__(__set_taint__('hello'));
