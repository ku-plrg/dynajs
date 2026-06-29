// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness always x.codePointAt(x.length-1)=105 ('i', clean suffix)
    __assert_taint__(x.codePointAt(x.length - 1), false);
}

__test_taint__(__set_taint__('hello'));
