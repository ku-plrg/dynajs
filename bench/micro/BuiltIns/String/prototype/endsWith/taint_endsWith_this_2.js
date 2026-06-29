// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @done

function __test_taint__(tainted) {
    var x0 = 'fo';
    var x = x0 + tainted;

    // @witness endsWith returns a boolean
    __assert_taint__(x.endsWith('z'), false);
}

__test_taint__(__set_taint__('ooo'));
