// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness always x.codePointAt(0)=104 ('h', clean prefix)
    __assert_taint__(x.codePointAt(0), false);
}

__test_taint__(__set_taint__('hello'));
