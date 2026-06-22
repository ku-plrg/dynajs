// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// @done

function __test_taint__(tainted) {
    var x = 'aXb';

    var parts = x.split(tainted);

    // @witness always parts[0][0]='a'; tainted is only the delimiter (not in output)
    __assert_taint__(parts[0][0], false);
}

__test_taint__(__set_taint__('X'));
