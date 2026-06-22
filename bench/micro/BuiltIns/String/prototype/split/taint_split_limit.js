// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// @done

function __test_taint__(tainted) {
    var x = 'a,b,c';

    var parts = x.split(',', tainted);

    // @witness always parts[0]='a' or undefined; tainted is only the count
    __assert_taint__(parts[0], false);
}

__test_taint__(__set_taint__(2));
