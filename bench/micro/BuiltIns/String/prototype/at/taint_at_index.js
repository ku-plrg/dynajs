// @type taint
// @target es6+ String.prototype.at
// @feature builtin at
// @done

function __test_taint__(tainted) {
    var x = 'hello';

    // @witness 'hello' clean; tainted is only the index
    __assert_taint__(x.at(tainted), false);
}

__test_taint__(__set_taint__(3));
