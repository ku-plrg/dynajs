// @type taint
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @done

function __test_taint__(tainted) {
    var x = 'h' + tainted + 'i';
    var r = x.toWellFormed();

    // @witness always r[r.length-1]='i' (clean suffix)
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));
