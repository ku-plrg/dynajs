// @type taint
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @done

function __test_taint__(tainted) {
    var x = 'h' + tainted + 'i';

    // @witness isWellFormed returns a boolean
    __assert_taint__(x.isWellFormed(), false);
}

__test_taint__(__set_taint__('hello'));
