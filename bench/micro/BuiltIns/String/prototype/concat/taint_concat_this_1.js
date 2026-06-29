// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat
// @done

function __test_taint__(tainted) {
    var x = tainted + 'wo';
    var r = x.concat('rld');

    // @witness __test_taint__('x') => r[0]='x' (tainted receiver char)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__('hello'));
