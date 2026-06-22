// @type taint
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// @done

function __test_taint__(tainted) {
    var x = 'banana';

    // @witness tainted is only the comparand; localeCompare returns -1/0/1
    __assert_taint__(x.localeCompare(tainted), false);
}

__test_taint__(__set_taint__('apple'));
