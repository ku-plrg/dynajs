// @type taint
// @target es5 String.prototype.search
// @feature builtin search
// @done

function __test_taint__(tainted) {
    var x = 'hello123';
    var re = new RegExp(tainted);

    // @witness tainted is only the regexp pattern; search returns a position number
    __assert_taint__(x.search(re), false);
}

__test_taint__(__set_taint__('[0-9]'));
