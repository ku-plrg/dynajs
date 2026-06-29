// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat
// @done

function __test_taint__(tainted) {
    var x = tainted + 'wo';
    var r = x.concat('rld');

    // @witness 'world' is clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__('hello'));
