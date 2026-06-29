// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done

function __test_taint__(tainted) {
    var x = 'a-b-c';

    var r = x.replaceAll(tainted, '+');

    // @witness 'a-b-c' clean; tainted is the searchValue (removed, not in result)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('-'));
