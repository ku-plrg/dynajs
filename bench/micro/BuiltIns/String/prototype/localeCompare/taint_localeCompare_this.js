// @type taint
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// @done

function __test_taint__(tainted) {
    var x0 = 'ban';
    var x2 = 'na';
    var x = x0 + tainted + x2;

    // @witness localeCompare returns -1/0/1, never content
    __assert_taint__(x.localeCompare('apple'), false);

    // @witness localeCompare returns -1/0/1, never content
    __assert_taint__(x.localeCompare('banana'), false);

    // @witness localeCompare returns -1/0/1, never content
    __assert_taint__(x.localeCompare('cherry'), false);
}

__test_taint__(__set_taint__('a'));
