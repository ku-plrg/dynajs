// @type taint
// @target es5 String.prototype.match
// @feature builtin match
// @done

function __test_taint__(tainted) {
    var x = 'hello123';
    var re = new RegExp(tainted);

    var m = x.match(re);

    // @witness 'hello123' clean; tainted is only the regexp (pattern not in result)
    __assert_taint__(m[0], false);
}

__test_taint__(__set_taint__('\\d+'));
