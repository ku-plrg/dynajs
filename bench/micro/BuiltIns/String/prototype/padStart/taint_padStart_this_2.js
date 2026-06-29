// @type taint
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x = tainted + x0;
    var r4 = x.padStart(4, '.');

    // @witness always r4[r4.length-1]='f' (clean suffix)
    __assert_taint__(r4[r4.length - 1], false);
}

__test_taint__(__set_taint__('o'));
