// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = 'hello world';

    var r = x.replace(tainted, 'there');

    // @witness 'hello world' clean; tainted is the searchValue (removed, not in result)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('world'));
