// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @done

function __test_taint__(tainted) {
    var x = 'foobar';

    // @witness tainted is only the endPosition index; endsWith returns a boolean
    __assert_taint__(x.endsWith('foo', tainted), false);
}

__test_taint__(__set_taint__(3));
