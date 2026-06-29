// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done

function __test_taint__(tainted) {
    var x = tainted + 'oo..';

    var r = x.replaceAll('.', 'X');

    // @witness always r[r.length-1]='X' clean suffix from literal replacement
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__('f'));
