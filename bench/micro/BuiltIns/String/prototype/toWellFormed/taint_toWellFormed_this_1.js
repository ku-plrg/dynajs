// @type taint
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @done

function __test_taint__(tainted) {
    var x = 'h' + tainted + 'i';
    var r = x.toWellFormed();

    // @witness always r[0]='h' (clean prefix)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));
