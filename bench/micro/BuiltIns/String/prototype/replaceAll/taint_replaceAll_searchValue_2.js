// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done

function __test_taint__(tainted) {
    var x = 'a-b-c';

    var r = x.replaceAll(tainted, '+');

    // @witness always r[1]='+' from literal replacement
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__('-'));
